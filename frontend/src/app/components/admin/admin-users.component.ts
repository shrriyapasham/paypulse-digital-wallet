import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { User, PageResponse } from '../../models/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container-fluid py-4 px-md-4">
      <!-- Header -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-danger rounded-pill px-2 py-1 small">ADMIN CONSOLE</span>
            <h3 class="fw-bold mb-0">User Account Management</h3>
          </div>
          <p class="text-muted small mb-0">View registered users, monitor balances, and freeze/unfreeze accounts.</p>
        </div>
        <a routerLink="/admin/dashboard" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-left"></i> Back to Dashboard
        </a>
      </div>

      <!-- Search & Filters -->
      <div class="card shadow-sm border-0 rounded-4 mb-4">
        <div class="card-body p-3 p-md-4">
          <form [formGroup]="filterForm" (ngSubmit)="applyFilters()">
            <div class="row g-3 align-items-end">
              <div class="col-md-4 col-sm-6">
                <label class="form-label small fw-semibold text-secondary">Search Users</label>
                <div class="input-group input-group-sm">
                  <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                  <input type="text" class="form-control" placeholder="Search by name, email, phone..." formControlName="search">
                </div>
              </div>

              <div class="col-md-3 col-sm-6">
                <label class="form-label small fw-semibold text-secondary">Role</label>
                <select class="form-select form-select-sm" formControlName="role">
                  <option value="">All Roles</option>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div class="col-md-3 col-sm-6">
                <label class="form-label small fw-semibold text-secondary">Status</label>
                <select class="form-select form-select-sm" formControlName="status">
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="BLOCKED">BLOCKED</option>
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

      <!-- Feedback Alert -->
      <div *ngIf="alertMessage" class="alert alert-dismissible fade show d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3"
           [ngClass]="alertType === 'success' ? 'alert-success' : 'alert-danger'">
        <i class="bi" [ngClass]="alertType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
        <div>{{ alertMessage }}</div>
        <button type="button" class="btn-close btn-sm p-2" (click)="alertMessage = ''"></button>
      </div>

      <!-- Users Table Card -->
      <div class="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div class="card-body p-0">
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="small text-muted mt-2">Loading users...</p>
          </div>

          <div *ngIf="!loading && users.length === 0" class="text-center py-5">
            <i class="bi bi-people text-muted display-4 opacity-50"></i>
            <h5 class="fw-bold mt-3">No Users Found</h5>
            <p class="text-muted small">No records match the given criteria.</p>
          </div>

          <div *ngIf="!loading && users.length > 0" class="table-responsive">
            <table class="table table-custom table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>User ID</th>
                  <th>User Info</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Wallet Balance</th>
                  <th>Status</th>
                  <th class="text-end">Administrative Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of users">
                  <td><span class="font-monospace text-muted">#{{ user.userId }}</span></td>
                  <td>
                    <div class="fw-bold text-dark">{{ user.name }}</div>
                    <div class="text-muted small" style="font-size: 0.75rem;">Member since {{ user.createdAt | date:'mediumDate' }}</div>
                  </td>
                  <td>
                    <div class="small text-dark">{{ user.email }}</div>
                    <div class="text-muted small">{{ user.phone }}</div>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="user.role === 'ADMIN' ? 'bg-danger' : 'bg-primary-subtle text-primary'">
                      {{ user.role }}
                    </span>
                  </td>
                  <td>
                    <span class="fw-bold text-success fs-6">₹{{ user.walletBalance | number:'1.2-2' }}</span>
                  </td>
                  <td>
                    <span class="badge badge-status" [ngClass]="user.status === 'ACTIVE' ? 'badge-success-soft' : 'badge-danger-soft'">
                      {{ user.status }}
                    </span>
                  </td>
                  <td class="text-end">
                    <ng-container *ngIf="user.role !== 'ADMIN'">
                      <button *ngIf="user.status === 'ACTIVE'"
                              class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1"
                              (click)="toggleBlockUser(user, true)">
                        <i class="bi bi-slash-circle me-1"></i> Block User
                      </button>
                      <button *ngIf="user.status === 'BLOCKED'"
                              class="btn btn-sm btn-success rounded-pill px-3 py-1 text-white"
                              (click)="toggleBlockUser(user, false)">
                        <i class="bi bi-check2-circle me-1"></i> Unblock User
                      </button>
                    </ng-container>
                    <span *ngIf="user.role === 'ADMIN'" class="text-muted small fst-italic">System Protected</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div *ngIf="pageData && pageData.totalPages > 1" class="d-flex justify-content-between align-items-center p-3 border-top">
            <span class="text-muted small">
              Page {{ currentPage + 1 }} of {{ pageData.totalPages }} (Total Users: {{ pageData.totalElements }})
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
export class AdminUsersComponent implements OnInit {
  filterForm: FormGroup;
  users: User[] = [];
  pageData: PageResponse<User> | null = null;
  currentPage: number = 0;
  loading: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'danger' = 'success';

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      role: [''],
      status: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    const v = this.filterForm.value;
    this.adminService.getUsers({
      search: v.search || undefined,
      role: v.role || undefined,
      status: v.status || undefined,
      page: this.currentPage,
      size: 10
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.pageData = res.data;
          this.users = res.data.content;
        }
      },
      error: () => this.loading = false
    });
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  resetFilters(): void {
    this.filterForm.reset({ search: '', role: '', status: '' });
    this.currentPage = 0;
    this.loadUsers();
  }

  changePage(p: number): void {
    this.currentPage = p;
    this.loadUsers();
  }

  toggleBlockUser(user: User, shouldBlock: boolean): void {
    const action = shouldBlock ? 'block' : 'unblock';
    if (!confirm(`Are you sure you want to ${action} user "${user.name}"?`)) {
      return;
    }

    const req$ = shouldBlock
      ? this.adminService.blockUser(user.userId)
      : this.adminService.unblockUser(user.userId);

    req$.subscribe({
      next: (res) => {
        this.alertType = 'success';
        this.alertMessage = `User "${user.name}" successfully ${shouldBlock ? 'blocked' : 'unblocked'}.`;
        this.loadUsers();
      },
      error: (err) => {
        this.alertType = 'danger';
        this.alertMessage = err.error?.message || `Failed to ${action} user.`;
      }
    });
  }
}
