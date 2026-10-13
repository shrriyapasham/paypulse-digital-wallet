import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3" style="background: radial-gradient(circle at top, #e0f2fe, #f8fafc);">
      <div class="card shadow-lg border-0 rounded-4 overflow-hidden" style="max-width: 500px; width: 100%;">
        <div class="card-header bg-primary text-white text-center py-4 border-0" style="background: linear-gradient(135deg, #1e40af, #2563eb) !important;">
          <div class="d-inline-flex p-3 bg-white bg-opacity-20 rounded-circle mb-2">
            <i class="bi bi-person-plus fs-2"></i>
          </div>
          <h3 class="fw-bold mb-1">Create Wallet Account</h3>
          <p class="text-white-50 small mb-0">Join PayPulse Digital Wallet System</p>
        </div>

        <div class="card-body p-4 p-md-5">
          <!-- Error Alert -->
          <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 rounded-3 py-2 px-3 small" role="alert">
            <i class="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
            <div>{{ errorMessage }}</div>
            <button type="button" class="btn-close btn-sm p-2" (click)="errorMessage = ''"></button>
          </div>

          <!-- Feature Note -->
          <div class="alert alert-info py-2 px-3 rounded-3 small mb-4 d-flex align-items-center gap-2">
            <i class="bi bi-info-circle-fill text-primary"></i>
            <span>Every new account automatically receives a verified wallet with ₹0 balance.</span>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <!-- Full Name -->
            <div class="mb-3">
              <label class="form-label small fw-semibold text-secondary">Full Name</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-person"></i></span>
                <input type="text" class="form-control border-start-0" placeholder="e.g. John Doe"
                       formControlName="name" [class.is-invalid]="f['name'].touched && f['name'].invalid">
              </div>
              <div *ngIf="f['name'].touched && f['name'].invalid" class="text-danger small mt-1">
                Name is required (at least 2 characters).
              </div>
            </div>

            <!-- Email -->
            <div class="mb-3">
              <label class="form-label small fw-semibold text-secondary">Email Address</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-envelope"></i></span>
                <input type="email" class="form-control border-start-0" placeholder="name@example.com"
                       formControlName="email" [class.is-invalid]="f['email'].touched && f['email'].invalid">
              </div>
              <div *ngIf="f['email'].touched && f['email'].invalid" class="text-danger small mt-1">
                <span *ngIf="f['email'].errors?.['required']">Email is required.</span>
                <span *ngIf="f['email'].errors?.['email']">Please enter a valid email address.</span>
              </div>
            </div>

            <!-- Phone Number -->
            <div class="mb-3">
              <label class="form-label small fw-semibold text-secondary">Phone Number</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-phone"></i></span>
                <input type="tel" class="form-control border-start-0" placeholder="+919876543210"
                       formControlName="phone" [class.is-invalid]="f['phone'].touched && f['phone'].invalid">
              </div>
              <div *ngIf="f['phone'].touched && f['phone'].invalid" class="text-danger small mt-1">
                Please enter a valid 10-15 digit phone number.
              </div>
            </div>

            <!-- Password -->
            <div class="mb-4">
              <label class="form-label small fw-semibold text-secondary">Password</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-lock"></i></span>
                <input [type]="showPassword ? 'text' : 'password'" class="form-control border-start-0 border-end-0"
                       placeholder="At least 6 characters" formControlName="password"
                       [class.is-invalid]="f['password'].touched && f['password'].invalid">
                <button class="btn btn-outline-secondary border-start-0" type="button" (click)="showPassword = !showPassword">
                  <i class="bi" [class.bi-eye]="!showPassword" [class.bi-eye-slash]="showPassword"></i>
                </button>
              </div>
              <div *ngIf="f['password'].touched && f['password'].invalid" class="text-danger small mt-1">
                Password must be at least 6 characters.
              </div>
            </div>

            <button type="submit" [disabled]="registerForm.invalid || loading" class="btn btn-primary w-100 py-2 fw-semibold shadow-sm">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Creating Account...' : 'Register & Create Wallet' }}
            </button>
          </form>

          <div class="text-center mt-4 pt-2">
            <span class="text-muted small">Already have an account? </span>
            <a routerLink="/login" class="small fw-semibold text-primary text-decoration-none">Sign In</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading: boolean = false;
  showPassword: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^(\\+?[0-9]{10,15})$')]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please check your details.';
      }
    });
  }
}
