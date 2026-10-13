import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Transaction, PageResponse } from '../../models/models';

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container-fluid py-4 px-md-4">
      <!-- Header -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-danger rounded-pill px-2 py-1 small">ADMIN CONSOLE</span>
            <h3 class="fw-bold mb-0">System Transaction Audit</h3>
          </div>
          <p class="text-muted small mb-0">Complete historical transaction ledger for all system users.</p>
        </div>
        <a routerLink="/admin/dashboard" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-left"></i> Back to Dashboard
        </a>
      </div>

      <!-- Filters -->
      <div class="card shadow-sm border-0 rounded-4 mb-4">
        <div class="card-body p-3 p-md-4">
          <form [formGroup]="filterForm" (ngSubmit)="applyFilters()">
            <div class="row g-3 align-items-end">
              <div class="col-md-4 col-sm-6">
                <label class="form-label small fw-semibold text-secondary">Search Audit Log</label>
                <div class="input-group input-group-sm">
                  <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                  <input type="text" class="form-control" placeholder="Search reference, sender, receiver..." formControlName="search">
                </div>
              </div>

              <div class="col-md-3 col-sm-6">
                <label class="form-label small fw-semibold text-secondary">Type</label>
                <select class="form-select form-select-sm" formControlName="type">
                  <option value="">All Types</option>
                  <option value="TRANSFER">TRANSFER</option>
                  <option value="ADD_MONEY">ADD_MONEY</option>
                  <option value="REFUND">REFUND</option>
                </select>
              </div>

              <div class="col-md-3 col-sm-6">
                <label class="form-label small fw-semibold text-secondary">Status</label>
                <select class="form-select form-select-sm" formControlName="status">
                  <option value="">All Statuses</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="FAILED">FAILED</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <div class="col-md-2 col-sm-6 d-flex gap-2">
                <button type="submit" class="btn btn-sm btn-primary flex-fill">
                  Filter
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
            <h5 class="fw-bold mt-3">No Transactions Found</h5>
            <p class="text-muted small">No transactions match the search filters.</p>
          </div>

          <div *ngIf="!loading && transactions.length > 0" class="table-responsive">
            <table class="table table-custom table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Txn ID</th>
                  <th>Reference</th>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let txn of transactions">
                  <td><span class="font-monospace text-muted small">#{{ txn.transactionId }}</span></td>
                  <td><span class="font-monospace text-primary fw-bold small">{{ txn.referenceNumber }}</span></td>
                  <td>
                    <span *ngIf="txn.senderName" class="fw-semibold text-dark">{{ txn.senderName }}</span>
                    <span *ngIf="!txn.senderName" class="badge bg-secondary-subtle text-secondary small">EXTERNAL / BANK</span>
                  </td>
                  <td>
                    <span class="fw-semibold text-dark">{{ txn.receiverName }}</span>
                  </td>
                  <td>
                    <span class="fw-bold fs-6" [ngClass]="txn.transactionType === 'ADD_MONEY' ? 'text-primary' : 'text-dark'">
                      ₹{{ txn.amount | number:'1.2-2' }}
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-light text-secondary border small">{{ txn.transactionType }}</span>
                  </td>
                  <td>
                    <span class="badge badge-status" [ngClass]="{
                      'badge-success-soft': txn.status === 'SUCCESS',
                      'badge-danger-soft': txn.status === 'FAILED',
                      'badge-warning-soft': txn.status === 'PENDING'
                    }">{{ txn.status }}</span>
                  </td>
                  <td>
                    <span class="small text-muted">{{ txn.transactionDate | date:'medium' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div *ngIf="pageData && pageData.totalPages > 1" class="d-flex justify-content-between align-items-center p-3 border-top">
            <span class="text-muted small">
              Page {{ currentPage + 1 }} of {{ pageData.totalPages }} (Total Txns: {{ pageData.totalElements }})
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
    </div>
  `
})
export class AdminTransactionsComponent implements OnInit {
  filterForm: FormGroup;
  transactions: Transaction[] = [];
  pageData: PageResponse<Transaction> | null = null;
  currentPage: number = 0;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      type: [''],
      status: ['']
    });
  }

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    const v = this.filterForm.value;
    this.adminService.getTransactions({
      search: v.search || undefined,
      type: v.type || undefined,
      status: v.status || undefined,
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
    this.filterForm.reset({ search: '', type: '', status: '' });
    this.currentPage = 0;
    this.loadTransactions();
  }

  changePage(p: number): void {
    this.currentPage = p;
    this.loadTransactions();
  }
}
