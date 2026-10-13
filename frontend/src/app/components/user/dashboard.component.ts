import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { WalletService } from '../../services/wallet.service';
import { TransactionService } from '../../services/transaction.service';
import { NotificationService } from '../../services/notification.service';
import { AuthResponse, Transaction, NotificationItem } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid py-4 px-md-4">
      <!-- Greeting Header -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 class="fw-bold mb-1">Hello, {{ currentUser?.name || 'User' }} 👋</h3>
          <p class="text-muted small mb-0">Welcome back to your PayPulse digital wallet dashboard.</p>
        </div>
        <div class="d-flex gap-2">
          <a routerLink="/wallet/add-money" class="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
            <i class="bi bi-plus-circle"></i> Add Money
          </a>
          <a routerLink="/transactions/send" class="btn btn-outline-primary d-flex align-items-center gap-2 shadow-sm">
            <i class="bi bi-send"></i> Send Money
          </a>
        </div>
      </div>

      <!-- Top Row: Wallet Card & Financial Metrics -->
      <div class="row g-3 mb-4">
        <!-- Main Wallet Balance Card -->
        <div class="col-lg-5">
          <div class="card card-wallet p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-start mb-3">
                <span class="badge bg-white bg-opacity-25 text-white px-3 py-1 rounded-pill small fw-semibold">
                  <i class="bi bi-check-circle-fill me-1 text-success"></i> ACTIVE WALLET
                </span>
                <i class="bi bi-shield-check fs-4 opacity-75"></i>
              </div>
              <div class="text-white-50 small text-uppercase tracking-wider mb-1">Available Balance</div>
              <h1 class="display-5 fw-bold mb-0">₹{{ balance | number:'1.2-2' }}</h1>
            </div>

            <div class="pt-4 border-top border-white border-opacity-20 d-flex justify-content-between align-items-center">
              <div>
                <div class="text-white-50 small" style="font-size: 0.75rem;">ACCOUNT HOLDER</div>
                <div class="fw-semibold small">{{ currentUser?.name }}</div>
              </div>
              <div class="text-end">
                <div class="text-white-50 small" style="font-size: 0.75rem;">STATUS</div>
                <span class="badge bg-success bg-opacity-75 rounded-pill">{{ currentUser?.status }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Money Summary Cards -->
        <div class="col-lg-7">
          <div class="row g-3 h-100">
            <!-- Total Sent -->
            <div class="col-sm-6">
              <div class="card p-3 h-100 border-start border-danger border-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted small fw-semibold">Total Money Sent</span>
                  <div class="bg-danger bg-opacity-10 text-danger rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
                    <i class="bi bi-arrow-up-right fs-5"></i>
                  </div>
                </div>
                <h3 class="fw-bold text-dark mb-1">₹{{ (summary?.totalSent || 0) | number:'1.2-2' }}</h3>
                <span class="text-muted small" style="font-size: 0.75rem;">Across all peer transfers</span>
              </div>
            </div>

            <!-- Total Received -->
            <div class="col-sm-6">
              <div class="card p-3 h-100 border-start border-success border-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted small fw-semibold">Total Money Received</span>
                  <div class="bg-success bg-opacity-10 text-success rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
                    <i class="bi bi-arrow-down-left fs-5"></i>
                  </div>
                </div>
                <h3 class="fw-bold text-dark mb-1">₹{{ (summary?.totalReceived || 0) | number:'1.2-2' }}</h3>
                <span class="text-muted small" style="font-size: 0.75rem;">From wallet transfers</span>
              </div>
            </div>

            <!-- Fast Action Banner -->
            <div class="col-12">
              <div class="card p-3 bg-light border-0 shadow-none">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
                  <div class="d-flex align-items-center gap-3">
                    <div class="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                      <i class="bi bi-lightning-charge fs-5"></i>
                    </div>
                    <div>
                      <div class="fw-bold small text-dark">Instant Zero-Fee Transfers</div>
                      <div class="text-muted" style="font-size: 0.8rem;">Transfer money directly using verified recipient email or phone.</div>
                    </div>
                  </div>
                  <a routerLink="/transactions/send" class="btn btn-sm btn-outline-primary fw-semibold">Send Now</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Row: Recent Transactions & Recent Notifications -->
      <div class="row g-3">
        <!-- Recent Transactions -->
        <div class="col-lg-8">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
              <h6 class="fw-bold mb-0 d-flex align-items-center gap-2">
                <i class="bi bi-clock-history text-primary"></i> Recent Transactions
              </h6>
              <a routerLink="/transactions/history" class="small fw-semibold text-primary text-decoration-none">View All History &rarr;</a>
            </div>

            <div class="card-body p-0">
              <div *ngIf="loadingTxns" class="text-center py-4">
                <span class="spinner-border spinner-border-sm text-primary"></span>
                <p class="small text-muted mt-2">Loading transactions...</p>
              </div>

              <div *ngIf="!loadingTxns && recentTransactions.length === 0" class="text-center py-5">
                <i class="bi bi-receipt text-muted fs-1 opacity-50"></i>
                <p class="text-muted small mt-2">No transactions recorded yet.</p>
                <a routerLink="/wallet/add-money" class="btn btn-sm btn-primary">Top up your wallet</a>
              </div>

              <div *ngIf="!loadingTxns && recentTransactions.length > 0" class="table-responsive">
                <table class="table table-custom table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Type / Counterparty</th>
                      <th>Reference</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let txn of recentTransactions">
                      <td>
                        <div class="d-flex align-items-center gap-2">
                          <div class="rounded-circle p-2 d-flex align-items-center justify-content-center"
                               [ngClass]="{
                                 'bg-success bg-opacity-10 text-success': txn.direction === 'RECEIVED' || txn.direction === 'TOP_UP',
                                 'bg-danger bg-opacity-10 text-danger': txn.direction === 'SENT'
                               }" style="width: 32px; height: 32px; font-size: 0.85rem;">
                            <i class="bi" [ngClass]="{
                              'bi-arrow-down-left': txn.direction === 'RECEIVED',
                              'bi-plus-circle': txn.direction === 'TOP_UP',
                              'bi-arrow-up-right': txn.direction === 'SENT'
                            }"></i>
                          </div>
                          <div>
                            <div class="fw-semibold small text-dark">
                              {{ txn.direction === 'TOP_UP' ? 'Wallet Top-up' : (txn.direction === 'SENT' ? 'To: ' + (txn.receiverName || 'Recipient') : 'From: ' + (txn.senderName || 'Sender')) }}
                            </div>
                            <div class="text-muted" style="font-size: 0.72rem;">{{ txn.description || txn.transactionType }}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="font-monospace small text-muted">{{ txn.referenceNumber }}</span>
                      </td>
                      <td>
                        <span class="small text-muted">{{ txn.transactionDate | date:'mediumDate' }}</span>
                      </td>
                      <td>
                        <span class="fw-bold" [ngClass]="{
                          'text-success': txn.direction === 'RECEIVED' || txn.direction === 'TOP_UP',
                          'text-danger': txn.direction === 'SENT'
                        }">
                          {{ txn.direction === 'SENT' ? '-' : '+' }}₹{{ txn.amount | number:'1.2-2' }}
                        </span>
                      </td>
                      <td>
                        <span class="badge badge-status" [ngClass]="{
                          'badge-success-soft': txn.status === 'SUCCESS',
                          'badge-danger-soft': txn.status === 'FAILED',
                          'badge-warning-soft': txn.status === 'PENDING'
                        }">{{ txn.status }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Notifications -->
        <div class="col-lg-4">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
              <h6 class="fw-bold mb-0 d-flex align-items-center gap-2">
                <i class="bi bi-bell text-warning"></i> Recent Alerts
              </h6>
              <a routerLink="/notifications" class="small fw-semibold text-primary text-decoration-none">View All</a>
            </div>

            <div class="card-body p-3">
              <div *ngIf="notifications.length === 0" class="text-center py-4">
                <i class="bi bi-bell-slash text-muted fs-3 opacity-50"></i>
                <p class="text-muted small mt-2">No notifications yet.</p>
              </div>

              <div class="list-group list-group-flush gap-2" *ngIf="notifications.length > 0">
                <div *ngFor="let notif of notifications"
                     class="list-group-item rounded-3 p-2 border-0 bg-light d-flex align-items-start gap-2">
                  <div class="bg-primary bg-opacity-10 text-primary rounded-circle p-1 d-flex align-items-center justify-content-center flex-shrink-0 mt-1" style="width: 24px; height: 24px; font-size: 0.75rem;">
                    <i class="bi bi-info-circle"></i>
                  </div>
                  <div class="flex-grow-1">
                    <p class="mb-1 small text-dark" style="font-size: 0.8rem; line-height: 1.3;">{{ notif.message }}</p>
                    <span class="text-muted" style="font-size: 0.68rem;">{{ notif.createdAt | date:'short' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  currentUser: AuthResponse | null = null;
  balance: number = 0;
  summary: any = null;
  recentTransactions: Transaction[] = [];
  notifications: NotificationItem[] = [];
  loadingTxns: boolean = true;

  constructor(
    private authService: AuthService,
    private walletService: WalletService,
    private transactionService: TransactionService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;

    this.walletService.balance$.subscribe(b => this.balance = b);
    this.walletService.getBalance().subscribe();

    this.transactionService.getSummary().subscribe({
      next: (res) => { if (res.success) this.summary = res.data; }
    });

    this.loadRecentTransactions();
    this.loadRecentNotifications();
  }

  loadRecentTransactions(): void {
    this.loadingTxns = true;
    this.transactionService.getRecent(5).subscribe({
      next: (res) => {
        this.loadingTxns = false;
        if (res.success && res.data) {
          this.recentTransactions = res.data;
        }
      },
      error: () => this.loadingTxns = false
    });
  }

  loadRecentNotifications(): void {
    this.notificationService.getRecent().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.notifications = res.data.slice(0, 5);
        }
      }
    });
  }
}
