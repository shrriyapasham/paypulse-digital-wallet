
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  template: `
    <div
      class="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3"
      style="background: radial-gradient(circle at top, #e0f2fe, #f8fafc);"
    >
      <div
        class="card shadow-lg border-0 rounded-4 overflow-hidden"
        style="max-width: 460px; width: 100%;"
      >

        <!-- PayPulse Header -->
        <div
          class="card-header bg-primary text-white text-center py-4 border-0"
          style="background: linear-gradient(135deg, #1e40af, #2563eb) !important;"
        >
          <div class="d-inline-flex p-3 bg-white bg-opacity-20 rounded-circle mb-2">
            <i class="bi bi-wallet2 fs-2"></i>
          </div>

          <h3 class="fw-bold mb-1">PayPulse</h3>

          <p class="text-white-50 small mb-0">
            Digital Wallet & Transaction Management
          </p>
        </div>

        <!-- Login Form -->
        <div class="card-body p-4 p-md-5">

          <h4 class="fw-bold text-dark mb-1">Sign In</h4>

          <p class="text-muted small mb-4">
            Access your wallet and manage transactions securely.
          </p>

          <!-- Error Message -->
          <div
            *ngIf="errorMessage"
            class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 rounded-3 py-2 px-3 small"
            role="alert"
          >
            <i class="bi bi-exclamation-triangle-fill flex-shrink-0"></i>

            <div>{{ errorMessage }}</div>

            <button
              type="button"
              class="btn-close btn-sm p-2"
              aria-label="Close"
              (click)="errorMessage = ''"
            ></button>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">

            <!-- Email Address -->
            <div class="mb-3">

              <label class="form-label small fw-semibold text-secondary">
                Email Address
              </label>

              <div class="input-group">

                <span class="input-group-text bg-light border-end-0 text-muted">
                  <i class="bi bi-envelope"></i>
                </span>

                <input
                  type="email"
                  class="form-control border-start-0"
                  placeholder="name@example.com"
                  formControlName="email"
                  autocomplete="email"
                  [class.is-invalid]="f['email'].touched && f['email'].invalid"
                />

              </div>

              <div
                *ngIf="f['email'].touched && f['email'].invalid"
                class="text-danger small mt-1"
              >
                <span *ngIf="f['email'].errors?.['required']">
                  Email address is required.
                </span>

                <span *ngIf="f['email'].errors?.['email']">
                  Please enter a valid email address.
                </span>
              </div>

            </div>

            <!-- Password -->
            <div class="mb-4">

              <label class="form-label small fw-semibold text-secondary">
                Password
              </label>

              <div class="input-group">

                <span class="input-group-text bg-light border-end-0 text-muted">
                  <i class="bi bi-lock"></i>
                </span>

                <input
                  [type]="showPassword ? 'text' : 'password'"
                  class="form-control border-start-0 border-end-0"
                  placeholder="Enter your password"
                  formControlName="password"
                  autocomplete="current-password"
                  [class.is-invalid]="f['password'].touched && f['password'].invalid"
                />

                <button
                  class="btn btn-outline-secondary border-start-0"
                  type="button"
                  aria-label="Toggle password visibility"
                  (click)="showPassword = !showPassword"
                >
                  <i
                    class="bi"
                    [class.bi-eye]="!showPassword"
                    [class.bi-eye-slash]="showPassword"
                  ></i>
                </button>

              </div>

              <div
                *ngIf="f['password'].touched && f['password'].invalid"
                class="text-danger small mt-1"
              >
                Password is required.
              </div>

            </div>

            <!-- Sign In Button -->
            <button
              type="submit"
              [disabled]="loginForm.invalid || loading"
              class="btn btn-primary w-100 py-2 fw-semibold shadow-sm"
            >
              <span
                *ngIf="loading"
                class="spinner-border spinner-border-sm me-2"
              ></span>

              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>

          </form>

          <!-- Create Account -->
          <div class="text-center mt-4 pt-2">

            <span class="text-muted small">
              Don't have an account?
            </span>

            <a
              routerLink="/register"
              class="small fw-semibold text-primary text-decoration-none"
            >
              Create Account
            </a>

          </div>

        </div>
      </div>
    </div>
  `
})
export class LoginComponent {

  loginForm: FormGroup;
  loading = false;
  showPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {

    if (this.loginForm.invalid || this.loading) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({

      next: (res) => {

        this.loading = false;

        if (!res.success || !res.data) {
          this.errorMessage = res.message || 'Login failed. Please try again.';
          return;
        }

        if (res.data.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }

      },

      error: (err) => {

        this.loading = false;

        this.errorMessage =
          err.error?.message ||
          'Login failed. Please check your credentials.';

      }

    });
  }
}
