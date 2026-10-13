import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { Transaction, PageResponse } from '../../models/models';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container-fluid py-4 px-md-4">
      <!-- Header -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 class="fw-bold mb-1">Transaction History</h3>
          <p class="text-muted small mb-0">Review all your wallet top-ups, transfers, and incoming payments.</p>
        </div>
        <div class="d-flex gap-2">
          <a routerLink="/transactions/send" class="btn btn-primary d-flex align-items-center gap-2">
            <i class="bi bi-send"></i> Send Money
          </a>
          <a routerLink="/wallet/add-money" class="btn btn-outline-primary d-flex align-items-center gap-2">
            <i class="bi bi-plus-circle"></i> Add Money
          </a>
        </div>
      </div>

      <!-- Filter Controls Card -->
      <div class="card shadow-sm border-0 rounded-4 mb-4">
        <div class="card-body p-3 p-md-4">
          <form [formGroup]="filterForm" (ngSubmit)="applyFilters()">
            <div class="row g-3 align-items-end">
              <!-- Type Filter -->
              <div class="col-md-3 col-sm-6">
                <label class="form-label small fw-semibold text-secondary">Transaction Type</label>
                <select class="form-select form-select-sm" formControlName="type">
                  <option value="">All Types</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="ADD_MONEY">Add Money (Top-up)</option>
                  <option value="REFUND">Refund</option>
                </select>
              </div>

              <!-- Status Filter -->
              <div class="col-md-3 col-sm-6">
                <label class="form-label small fw-semibold text-secondary">Status</label>
                <select class="form-select form-select-sm" formControlName="status">
                  <option value="">All Statuses</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>

              <!-- Min Amount -->
              <div class="col-md-2 col-sm-6">
                <label class="form-label small fw-semibold text-secondary">Min Amount (₹)</label>
                <input type="number" class="form-control form-control-sm" placeholder="e.g. 100" formControlName="minAmount">
              </div>

              <!-- Max Amount -->
              <div class="col-md-2 col-sm-6">
                <label class="form-label small fw-semibold text-secondary">Max Amount (₹)</label>
                <input type="number" class="form-control form-control-sm" placeholder="e.g. 5000" formControlName="maxAmount">
              </div>

              <!-- Action Buttons -->
              <div class="col-md-2 col-sm-12 d-flex gap-2">
                <button type="submit" class="btn btn-sm btn-primary flex-fill">
                  <i class="bi bi-filter"></i> Filter
                </button>
                <button type="button" class="btn btn-sm btn-outline-secondary" (click)="resetFilters()">
                  <i class="bi bi-arrow-counterclockwise"></i>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Transactions Table Card -->
      <div class="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div class="card-body p-0">
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="small text-muted mt-2">Loading transactions...</p>
          </div>

          <div *ngIf="!loading && transactions.length === 0" class="text-center py-5">
            <i class="bi bi-receipt-cutoff text-muted display-4 opacity-50"></i>
            <h5 class="fw-bold mt-3">No transactions found</h5>
            <p class="text-muted small">No records match your selected filters.</p>
          </div>

          <div *ngIf="!loading && transactions.length > 0" class="table-responsive">
            <table class="table table-custom table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Date & Time</th>
                  <th>Transaction / Counterparty</th>
                  <th>Type</th>
                  <th>Reference</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th class="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let txn of transactions">
                  <!-- Date -->
                  <td>
                    <div class="fw-semibold small text-dark">{{ txn.transactionDate | date:'mediumDate' }}</div>
                    <div class="text-muted" style="font-size: 0.72rem;">{{ txn.transactionDate | date:'shortTime' }}</div>
                  </td>

                  <!-- Counterparty -->
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="rounded-circle p-2 d-flex align-items-center justify-content-center"
                           [ngClass]="{
                             'bg-success bg-opacity-10 text-success': txn.direction === 'RECEIVED' || txn.direction === 'TOP_UP',
                             'bg-danger bg-opacity-10 text-danger': txn.direction === 'SENT'
                           }" style="width: 32px; height: 32px;">
                        <i class="bi" [ngClass]="{
                          'bi-arrow-down-left': txn.direction === 'RECEIVED',
                          'bi-plus-circle': txn.direction === 'TOP_UP',
                          'bi-arrow-up-right': txn.direction === 'SENT'
                        }"></i>
                      </div>
                      <div>
                        <div class="fw-bold small text-dark">
                          {{ txn.direction === 'TOP_UP' ? 'Wallet Top-up' : (txn.direction === 'SENT' ? 'To: ' + txn.receiverName : 'From: ' + txn.senderName) }}
                        </div>
                        <div class="text-muted text-truncate" style="font-size: 0.72rem; max-width: 180px;">
                          {{ txn.description || 'No description' }}
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Type -->
                  <td>
                    <span class="badge bg-light text-secondary border small">{{ txn.transactionType }}</span>
                  </td>

                  <!-- Reference -->
                  <td>
                    <span class="font-monospace small text-primary fw-semibold">{{ txn.referenceNumber }}</span>
                  </td>

                  <!-- Amount -->
                  <td>
                    <span class="fw-bold" [ngClass]="{
                      'text-success': txn.direction === 'RECEIVED' || txn.direction === 'TOP_UP',
                      'text-danger': txn.direction === 'SENT'
                    }">
                      {{ txn.direction === 'SENT' ? '-' : '+' }}₹{{ txn.amount | number:'1.2-2' }}
                    </span>
                  </td>

                  <!-- Status -->
                  <td>
                    <span class="badge badge-status" [ngClass]="{
                      'badge-success-soft': txn.status === 'SUCCESS',
                      'badge-danger-soft': txn.status === 'FAILED',
                      'badge-warning-soft': txn.status === 'PENDING'
                    }">
                      {{ txn.status }}
                    </span>
                  </td>

                  <!-- Action -->
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1"
                            (click)="viewDetails(txn)">
                      <i class="bi bi-eye"></i> Details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div *ngIf="pageData && pageData.totalPages > 1" class="d-flex justify-content-between align-items-center p-3 border-top">
            <span class="text-muted small">
              Page {{ currentPage + 1 }} of {{ pageData.totalPages }} (Total: {{ pageData.totalElements }})
            </span>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-secondary" [disabled]="currentPage === 0" (click)="changePage(currentPage - 1)">
                &laquo; Prev
              </button>
              <button class="btn btn-outline-secondary" [disabled]="currentPage >= pageData.totalPages - 1" (click)="changePage(currentPage + 1)">
                Next &raquo;
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Transaction Details Modal -->
      <div *ngIf="selectedTxn" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
            <div class="modal-header bg-primary text-white border-0 py-3" style="background: linear-gradient(135deg, #1e40af, #2563eb) !important;">
              <h5 class="modal-title fw-bold">
                <i class="bi bi-receipt me-2"></i> Transaction Receipt
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="selectedTxn = null"></button>
            </div>
            <div class="modal-body p-4">
              <div class="text-center mb-4">
                <div class="rounded-circle d-inline-flex p-3 mb-2"
                     [ngClass]="{
                       'bg-success bg-opacity-10 text-success': selectedTxn.status === 'SUCCESS',
                       'bg-danger bg-opacity-10 text-danger': selectedTxn.status === 'FAILED',
                       'bg-warning bg-opacity-10 text-warning': selectedTxn.status === 'PENDING'
                     }">
                  <i class="bi" [ngClass]="{
                    'bi-check-circle-fill display-5': selectedTxn.status === 'SUCCESS',
                    'bi-x-circle-fill display-5': selectedTxn.status === 'FAILED',
                    'bi-hourglass-split display-5': selectedTxn.status === 'PENDING'
                  }"></i>
                </div>
                <h3 class="fw-bold mb-0" [ngClass]="{
                  'text-success': selectedTxn.direction === 'RECEIVED' || selectedTxn.direction === 'TOP_UP',
                  'text-danger': selectedTxn.direction === 'SENT'
                }">
                  {{ selectedTxn.direction === 'SENT' ? '-' : '+' }}₹{{ selectedTxn.amount | number:'1.2-2' }}
                </h3>
                <span class="badge badge-status mt-1" [ngClass]="{
                  'badge-success-soft': selectedTxn.status === 'SUCCESS',
                  'badge-danger-soft': selectedTxn.status === 'FAILED',
                  'badge-warning-soft': selectedTxn.status === 'PENDING'
                }">{{ selectedTxn.status }}</span>
              </div>

              <div class="bg-light p-3 rounded-3 small">
                <div class="d-flex justify-content-between py-2 border-bottom">
                  <span class="text-muted">Transaction ID</span>
                  <span class="fw-bold text-dark">#{{ selectedTxn.transactionId }}</span>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                  <span class="text-muted">Reference Number</span>
                  <span class="font-monospace text-primary fw-bold">{{ selectedTxn.referenceNumber }}</span>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                  <span class="text-muted">Transaction Type</span>
                  <span class="fw-semibold text-dark">{{ selectedTxn.transactionType }}</span>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom" *ngIf="selectedTxn.senderName">
                  <span class="text-muted">Sender</span>
                  <span class="fw-semibold text-dark">{{ selectedTxn.senderName }} ({{ selectedTxn.senderEmail }})</span>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                  <span class="text-muted">Receiver</span>
                  <span class="fw-semibold text-dark">{{ selectedTxn.receiverName }} ({{ selectedTxn.receiverEmail }})</span>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                  <span class="text-muted">Description</span>
                  <span class="text-dark">{{ selectedTxn.description || 'N/A' }}</span>
                </div>
                <div class="d-flex justify-content-between py-2">
                  <span class="text-muted">Timestamp</span>
                  <span class="text-dark">{{ selectedTxn.transactionDate | date:'medium' }}</span>
                </div>
              </div>
            </div>
            <div class="modal-footer border-0 bg-light p-3">
              <button type="button" class="btn btn-secondary w-100" (click)="selectedTxn = null">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TransactionHistoryComponent implements OnInit {
  filterForm: FormGroup;
  transactions: Transaction[] = [];
  pageData: PageResponse<Transaction> | null = null;
  currentPage: number = 0;
  loading: boolean = false;
  selectedTxn: Transaction | null = null;

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService
  ) {
    this.filterForm = this.fb.group({
      type: [''],
      status: [''],
      minAmount: [null],
      maxAmount: [null]
    });
  }

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    const values = this.filterForm.value;
    this.transactionService.getHistory({
      type: values.type || undefined,
      status: values.status || undefined,
      minAmount: values.minAmount || undefined,
      maxAmount: values.maxAmount || undefined,
      page: this.currentPage,
      size: 10
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.pageData = res.data;
          this.transactions = res.data.content;
        }
      },
      error: () => this.loading = false
    });
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadTransactions();
  }

  resetFilters(): void {
    this.filterForm.reset({ type: '', status: '', minAmount: null, maxAmount: null });
    this.currentPage = 0;
    this.loadTransactions();
  }

  changePage(newPage: number): void {
    this.currentPage = newPage;
    this.loadTransactions();
  }

  viewDetails(txn: Transaction): void {
    this.selectedTxn = txn;
  }
}
