import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container py-4" style="max-width: 800px;">
      <!-- Title -->
      <div class="mb-4">
        <a routerLink="/dashboard" class="btn btn-sm btn-link text-decoration-none ps-0 text-muted mb-2">
          <i class="bi bi-arrow-left"></i> Back to Dashboard
        </a>
        <h3 class="fw-bold mb-1">My Profile & Security</h3>
        <p class="text-muted small">Manage your account information and credentials.</p>
      </div>

      <div class="row g-4">
        <!-- Profile Overview Card -->
        <div class="col-md-5">
          <div class="card shadow-sm border-0 rounded-4 text-center p-4 h-100">
            <div class="card-body">
              <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow"
                   style="width: 80px; height: 80px; font-size: 2rem; font-weight: bold;">
                {{ profile?.name?.charAt(0)?.toUpperCase() || 'U' }}
              </div>
              <h5 class="fw-bold mb-1">{{ profile?.name }}</h5>
              <p class="text-muted small mb-3">{{ profile?.email }}</p>

              <div class="d-flex justify-content-center gap-2 mb-4">
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1">
                  {{ profile?.role }}
                </span>
                <span class="badge rounded-pill px-3 py-1"
                      [ngClass]="profile?.status === 'ACTIVE' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                  {{ profile?.status }}
                </span>
              </div>

              <div class="border-top pt-3 text-start small">
                <div class="d-flex justify-content-between py-2 border-bottom">
                  <span class="text-muted">User ID</span>
                  <span class="fw-bold text-dark">#{{ profile?.userId }}</span>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                  <span class="text-muted">Phone</span>
                  <span class="text-dark">{{ profile?.phone }}</span>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                  <span class="text-muted">Wallet ID</span>
                  <span class="font-monospace text-primary fw-bold">#{{ profile?.walletId || 'N/A' }}</span>
                </div>
                <div class="d-flex justify-content-between py-2">
                  <span class="text-muted">Wallet Balance</span>
                  <span class="fw-bold text-success">₹{{ profile?.walletBalance | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Change Password Card -->
        <div class="col-md-7">
          <div class="card shadow-sm border-0 rounded-4 p-4 h-100">
            <div class="card-body">
              <h5 class="fw-bold mb-1 d-flex align-items-center gap-2">
                <i class="bi bi-shield-lock text-warning"></i> Change Password
              </h5>
              <p class="text-muted small mb-4">Ensure your account remains safe with a strong password.</p>

              <!-- Success Alert -->
              <div *ngIf="pwdSuccess" class="alert alert-success py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                <i class="bi bi-check-circle-fill"></i>
                <span>Password updated successfully!</span>
              </div>

              <!-- Error Alert -->
              <div *ngIf="pwdError" class="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                <i class="bi bi-exclamation-circle-fill"></i>
                <span>{{ pwdError }}</span>
              </div>

              <form [formGroup]="pwdForm" (ngSubmit)="onChangePassword()">
                <!-- Current Password -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-secondary">Current Password</label>
                  <input type="password" class="form-control" placeholder="Enter current password"
                         formControlName="currentPassword" [class.is-invalid]="pf['currentPassword'].touched && pf['currentPassword'].invalid">
                  <div *ngIf="pf['currentPassword'].touched && pf['currentPassword'].invalid" class="text-danger small mt-1">
                    Current password is required.
                  </div>
                </div>

                <!-- New Password -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-secondary">New Password</label>
                  <input type="password" class="form-control" placeholder="At least 6 characters"
                         formControlName="newPassword" [class.is-invalid]="pf['newPassword'].touched && pf['newPassword'].invalid">
                  <div *ngIf="pf['newPassword'].touched && pf['newPassword'].invalid" class="text-danger small mt-1">
                    New password must be at least 6 characters.
                  </div>
                </div>

                <!-- Confirm New Password -->
                <div class="mb-4">
                  <label class="form-label small fw-semibold text-secondary">Confirm New Password</label>
                  <input type="password" class="form-control" placeholder="Repeat new password"
                         formControlName="confirmPassword" [class.is-invalid]="pf['confirmPassword'].touched && pf['confirmPassword'].invalid">
                  <div *ngIf="pwdForm.hasError('mismatch') && pf['confirmPassword'].touched" class="text-danger small mt-1">
                    Passwords do not match.
                  </div>
                </div>

                <button type="submit" [disabled]="pwdForm.invalid || pwdLoading" class="btn btn-primary w-100 py-2 fw-semibold shadow-sm">
                  <span *ngIf="pwdLoading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ pwdLoading ? 'Updating Password...' : 'Update Password' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  profile: User | null = null;
  pwdForm: FormGroup;
  pwdLoading: boolean = false;
  pwdSuccess: boolean = false;
  pwdError: string = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.pwdForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  get pf() { return this.pwdForm.controls; }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  loadProfile(): void {
    this.userService.getProfile().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.profile = res.data;
        }
      }
    });
  }

  onChangePassword(): void {
    if (this.pwdForm.invalid) return;

    this.pwdLoading = true;
    this.pwdSuccess = false;
    this.pwdError = '';

    const payload = {
      currentPassword: this.pwdForm.get('currentPassword')?.value,
      newPassword: this.pwdForm.get('newPassword')?.value
    };

    this.userService.changePassword(payload).subscribe({
      next: () => {
        this.pwdLoading = false;
        this.pwdSuccess = true;
        this.pwdForm.reset();
      },
      error: (err) => {
        this.pwdLoading = false;
        this.pwdError = err.error?.message || 'Failed to update password. Please check your current password.';
      }
    });
  }
}
