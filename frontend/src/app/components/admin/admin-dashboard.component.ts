import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AdminDashboardStats } from '../../models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid py-4 px-md-4">
      <!-- Title -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-danger rounded-pill px-2 py-1 small">ADMIN CONSOLE</span>
            <h3 class="fw-bold mb-0">System Overview & Analytics</h3>
          </div>
          <p class="text-muted small mb-0">Real-time monitoring of users, wallet balances, and transactions.</p>
        </div>
        <div class="d-flex gap-2">
          <a routerLink="/admin/users" class="btn btn-outline-primary d-flex align-items-center gap-2">
            <i class="bi bi-people"></i> Manage Users
          </a>
          <a routerLink="/admin/transactions" class="btn btn-outline-success d-flex align-items-center gap-2">
            <i class="bi bi-receipt"></i> Audit Transactions
          </a>
        </div>
      </div>

      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="small text-muted mt-2">Loading system telemetry...</p>
      </div>

      <div *ngIf="!loading && stats">
        <!-- 8 Stat Metric Cards Grid -->
        <div class="row g-3 mb-4">
          <!-- Total Users -->
          <div class="col-xl-3 col-md-6">
            <div class="card p-3 h-100 border-start border-primary border-4 shadow-sm">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small fw-semibold">Total Registered Users</span>
                <div class="bg-primary bg-opacity-10 text-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                  <i class="bi bi-people-fill"></i>
                </div>
              </div>
              <h3 class="fw-bold text-dark mb-0">{{ stats.totalUsers }}</h3>
              <div class="small text-muted mt-1" style="font-size: 0.75rem;">Accounts on platform</div>
            </div>
          </div>

          <!-- Active Users -->
          <div class="col-xl-3 col-md-6">
            <div class="card p-3 h-100 border-start border-success border-4 shadow-sm">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small fw-semibold">Active Users</span>
                <div class="bg-success bg-opacity-10 text-success rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                  <i class="bi bi-person-check-fill"></i>
                </div>
              </div>
              <h3 class="fw-bold text-success mb-0">{{ stats.activeUsers }}</h3>
              <div class="small text-muted mt-1" style="font-size: 0.75rem;">Can transact freely</div>
            </div>
          </div>

          <!-- Blocked Users -->
          <div class="col-xl-3 col-md-6">
            <div class="card p-3 h-100 border-start border-danger border-4 shadow-sm">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small fw-semibold">Blocked Users</span>
                <div class="bg-danger bg-opacity-10 text-danger rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                  <i class="bi bi-person-x-fill"></i>
                </div>
              </div>
              <h3 class="fw-bold text-danger mb-0">{{ stats.blockedUsers }}</h3>
              <div class="small text-muted mt-1" style="font-size: 0.75rem;">Restricted by admin</div>
            </div>
          </div>

          <!-- Total Transactions -->
          <div class="col-xl-3 col-md-6">
            <div class="card p-3 h-100 border-start border-info border-4 shadow-sm">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small fw-semibold">Total Transactions</span>
                <div class="bg-info bg-opacity-10 text-info rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                  <i class="bi bi-arrow-left-right"></i>
                </div>
              </div>
              <h3 class="fw-bold text-dark mb-0">{{ stats.totalTransactions }}</h3>
              <div class="small text-muted mt-1" style="font-size: 0.75rem;">Top-ups + Transfers</div>
            </div>
          </div>

          <!-- Successful Transactions -->
          <div class="col-xl-3 col-md-6">
            <div class="card p-3 h-100 border-start border-success border-4 shadow-sm">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small fw-semibold">Successful Txns</span>
                <div class="bg-success bg-opacity-10 text-success rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                  <i class="bi bi-check-circle-fill"></i>
                </div>
              </div>
              <h3 class="fw-bold text-success mb-0">{{ stats.successfulTransactions }}</h3>
              <div class="small text-muted mt-1" style="font-size: 0.75rem;">Settled without error</div>
            </div>
          </div>

          <!-- Failed Transactions -->
          <div class="col-xl-3 col-md-6">
            <div class="card p-3 h-100 border-start border-warning border-4 shadow-sm">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small fw-semibold">Failed Transactions</span>
                <div class="bg-warning bg-opacity-10 text-warning rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                  <i class="bi bi-x-circle-fill"></i>
                </div>
              </div>
              <h3 class="fw-bold text-warning mb-0">{{ stats.failedTransactions }}</h3>
              <div class="small text-muted mt-1" style="font-size: 0.75rem;">Declined / rolled back</div>
            </div>
          </div>

          <!-- Total Wallet Balance -->
          <div class="col-xl-3 col-md-6">
            <div class="card p-3 h-100 border-start border-primary border-4 shadow-sm">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small fw-semibold">Total System Balance</span>
                <div class="bg-primary bg-opacity-10 text-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                  <i class="bi bi-wallet-fill"></i>
                </div>
              </div>
              <h3 class="fw-bold text-primary mb-0">₹{{ stats.totalWalletBalance | number:'1.2-2' }}</h3>
              <div class="small text-muted mt-1" style="font-size: 0.75rem;">Total funds held</div>
            </div>
          </div>

          <!-- Total Money Transferred -->
          <div class="col-xl-3 col-md-6">
            <div class="card p-3 h-100 border-start border-dark border-4 shadow-sm">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small fw-semibold">Total Money Transferred</span>
                <div class="bg-dark bg-opacity-10 text-dark rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                  <i class="bi bi-cash-stack"></i>
                </div>
              </div>
              <h3 class="fw-bold text-dark mb-0">₹{{ stats.totalMoneyTransferred | number:'1.2-2' }}</h3>
              <div class="small text-muted mt-1" style="font-size: 0.75rem;">Peer-to-peer turnover</div>
            </div>
          </div>
        </div>

        <!-- Visual Analytical Progress Breakdown (Requirement 20) -->
        <div class="row g-4 mb-4">
          <!-- User Base Distribution -->
          <div class="col-md-6">
            <div class="card shadow-sm border-0 rounded-4 p-4 h-100">
              <h5 class="fw-bold mb-3 d-flex align-items-center gap-2">
                <i class="bi bi-pie-chart-fill text-primary"></i> User Status Breakdown
              </h5>
              <div class="mb-3">
                <div class="d-flex justify-content-between small fw-semibold mb-1">
                  <span class="text-success"><i class="bi bi-circle-fill" style="font-size: 0.6rem;"></i> Active Users</span>
                  <span>{{ stats.activeUsers }} ({{ getPercentage(stats.activeUsers, stats.totalUsers) }}%)</span>
                </div>
                <div class="progress" style="height: 10px;">
                  <div class="progress-bar bg-success" [style.width.%]="getPercentage(stats.activeUsers, stats.totalUsers)"></div>
                </div>
              </div>

              <div>
                <div class="d-flex justify-content-between small fw-semibold mb-1">
                  <span class="text-danger"><i class="bi bi-circle-fill" style="font-size: 0.6rem;"></i> Blocked Users</span>
                  <span>{{ stats.blockedUsers }} ({{ getPercentage(stats.blockedUsers, stats.totalUsers) }}%)</span>
                </div>
                <div class="progress" style="height: 10px;">
                  <div class="progress-bar bg-danger" [style.width.%]="getPercentage(stats.blockedUsers, stats.totalUsers)"></div>
                </div>
              </div>

              <div class="mt-4 pt-3 border-top small text-muted">
                System enforces immediate transaction freezes on any blocked user account.
              </div>
            </div>
          </div>

          <!-- Transaction Success Rate -->
          <div class="col-md-6">
            <div class="card shadow-sm border-0 rounded-4 p-4 h-100">
              <h5 class="fw-bold mb-3 d-flex align-items-center gap-2">
                <i class="bi bi-bar-chart-fill text-success"></i> Transaction Health Rate
              </h5>
              <div class="mb-3">
                <div class="d-flex justify-content-between small fw-semibold mb-1">
                  <span class="text-success"><i class="bi bi-circle-fill" style="font-size: 0.6rem;"></i> Settlement Success Rate</span>
                  <span>{{ getPercentage(stats.successfulTransactions, stats.totalTransactions) }}%</span>
                </div>
                <div class="progress" style="height: 10px;">
                  <div class="progress-bar bg-success" [style.width.%]="getPercentage(stats.successfulTransactions, stats.totalTransactions)"></div>
                </div>
              </div>

              <div>
                <div class="d-flex justify-content-between small fw-semibold mb-1">
                  <span class="text-danger"><i class="bi bi-circle-fill" style="font-size: 0.6rem;"></i> Failure / Rollback Rate</span>
                  <span>{{ getPercentage(stats.failedTransactions, stats.totalTransactions) }}%</span>
                </div>
                <div class="progress" style="height: 10px;">
                  <div class="progress-bar bg-danger" [style.width.%]="getPercentage(stats.failedTransactions, stats.totalTransactions)"></div>
                </div>
              </div>

              <div class="mt-4 pt-3 border-top small text-muted">
                All money transfers execute under Spring <code>&#64;Transactional</code> isolation guaranteeing zero balance leakage.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminDashboardStats | null = null;
  loading: boolean = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loading = true;
    this.adminService.getDashboardStats().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.stats = res.data;
        }
      },
      error: () => this.loading = false
    });
  }

  getPercentage(part: number, total: number): number {
    if (!total || total === 0) return 0;
    return Math.round((part / total) * 100);
  }
}
