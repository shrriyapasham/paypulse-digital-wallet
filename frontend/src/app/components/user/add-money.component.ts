import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { WalletService } from '../../services/wallet.service';
import { PaymentMethod, AddMoneyResponse } from '../../models/models';

@Component({
  selector: 'app-add-money',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container py-4" style="max-width: 680px;">
      <!-- Title -->
      <div class="mb-4">
        <a routerLink="/dashboard" class="btn btn-sm btn-link text-decoration-none ps-0 text-muted mb-2">
          <i class="bi bi-arrow-left"></i> Back to Dashboard
        </a>
        <h3 class="fw-bold mb-1">Add Money to Wallet</h3>
        <p class="text-muted small">Top up your digital wallet using a safe simulated payment process.</p>
      </div>

      <!-- State 1: Form Input -->
      <div *ngIf="state === 'INPUT'" class="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div class="card-body p-4 p-md-5">
          <!-- Current Balance Info -->
          <div class="d-flex justify-content-between align-items-center bg-light p-3 rounded-3 mb-4">
            <div>
              <span class="text-muted small">Current Wallet Balance</span>
              <h4 class="fw-bold text-dark mb-0">₹{{ currentBalance | number:'1.2-2' }}</h4>
            </div>
            <div class="badge bg-primary-subtle text-primary p-2 px-3 rounded-pill fw-semibold">
              <i class="bi bi-shield-check"></i> Safe Simulation
            </div>
          </div>

          <!-- Error Alert -->
          <div *ngIf="errorMessage" class="alert alert-danger py-2 px-3 small rounded-3 mb-3">
            <i class="bi bi-exclamation-circle-fill me-1"></i> {{ errorMessage }}
          </div>

          <form [formGroup]="topupForm" (ngSubmit)="initiateTopup()">
            <!-- Amount -->
            <div class="mb-4">
              <label class="form-label small fw-semibold text-secondary">Enter Amount (₹)</label>
              <div class="input-group input-group-lg">
                <span class="input-group-text bg-white fw-bold text-muted">₹</span>
                <input type="number" class="form-control fw-bold fs-4" placeholder="500"
                       formControlName="amount" [class.is-invalid]="f['amount'].touched && f['amount'].invalid">
              </div>
              <div *ngIf="f['amount'].touched && f['amount'].invalid" class="text-danger small mt-1">
                Please enter an amount greater than ₹0.
              </div>

              <!-- Quick Preset Amounts -->
              <div class="d-flex flex-wrap gap-2 mt-3">
                <button *ngFor="let preset of presets" type="button"
                        (click)="setAmount(preset)"
                        class="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1"
                        [class.active]="topupForm.get('amount')?.value === preset">
                  + ₹{{ preset }}
                </button>
              </div>
            </div>

            <!-- Payment Method Selection -->
            <div class="mb-4">
              <label class="form-label small fw-semibold text-secondary mb-2">Select Payment Method</label>

              <div class="row g-3">
                <!-- UPI -->
                <div class="col-4">
                  <div class="border rounded-3 p-3 text-center cursor-pointer h-100 method-card"
                       [class.border-primary]="topupForm.get('paymentMethod')?.value === 'UPI'"
                       [class.bg-primary-subtle]="topupForm.get('paymentMethod')?.value === 'UPI'"
                       (click)="setMethod('UPI')">
                    <i class="bi bi-qr-code-scan fs-3 text-primary d-block mb-1"></i>
                    <span class="small fw-semibold d-block">UPI</span>
                    <span class="text-muted" style="font-size: 0.68rem;">GPay / PhonePe</span>
                  </div>
                </div>

                <!-- Card -->
                <div class="col-4">
                  <div class="border rounded-3 p-3 text-center cursor-pointer h-100 method-card"
                       [class.border-primary]="topupForm.get('paymentMethod')?.value === 'CARD'"
                       [class.bg-primary-subtle]="topupForm.get('paymentMethod')?.value === 'CARD'"
                       (click)="setMethod('CARD')">
                    <i class="bi bi-credit-card-2-front fs-3 text-success d-block mb-1"></i>
                    <span class="small fw-semibold d-block">Debit / Card</span>
                    <span class="text-muted" style="font-size: 0.68rem;">Visa / Master</span>
                  </div>
                </div>

                <!-- Net Banking -->
                <div class="col-4">
                  <div class="border rounded-3 p-3 text-center cursor-pointer h-100 method-card"
                       [class.border-primary]="topupForm.get('paymentMethod')?.value === 'NET_BANKING'"
                       [class.bg-primary-subtle]="topupForm.get('paymentMethod')?.value === 'NET_BANKING'"
                       (click)="setMethod('NET_BANKING')">
                    <i class="bi bi-bank fs-3 text-warning d-block mb-1"></i>
                    <span class="small fw-semibold d-block">Net Banking</span>
                    <span class="text-muted" style="font-size: 0.68rem;">All Major Banks</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Simulated details per method -->
            <div class="bg-light p-3 rounded-3 mb-4 border">
              <div *ngIf="topupForm.get('paymentMethod')?.value === 'UPI'" class="small text-muted">
                <i class="bi bi-info-circle text-primary me-1"></i> Simulated UPI Gateway: Payment request will be automatically approved in test mode.
              </div>
              <div *ngIf="topupForm.get('paymentMethod')?.value === 'CARD'" class="small text-muted">
                <i class="bi bi-info-circle text-success me-1"></i> Simulated Card Gateway: Test Sandbox Visa ****4242 will be debited.
              </div>
              <div *ngIf="topupForm.get('paymentMethod')?.value === 'NET_BANKING'" class="small text-muted">
                <i class="bi bi-info-circle text-warning me-1"></i> Simulated Bank Gateway: Instant simulated NetBanking authorization.
              </div>
            </div>

            <button type="submit" [disabled]="topupForm.invalid" class="btn btn-primary w-100 py-3 fw-semibold shadow-sm">
              <i class="bi bi-arrow-right-circle me-1"></i> Proceed to Add ₹{{ (topupForm.get('amount')?.value || 0) | number:'1.2-2' }}
            </button>
          </form>
        </div>
      </div>

      <!-- State 2: Simulated Processing Modal/View -->
      <div *ngIf="state === 'PROCESSING'" class="card shadow-lg border-0 rounded-4 text-center p-5">
        <div class="py-4">
          <div class="spinner-grow text-primary mb-3" style="width: 3.5rem; height: 3.5rem;" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <h4 class="fw-bold mb-2">Simulating Secure Payment</h4>
          <p class="text-muted small mb-3">Connecting to {{ topupForm.get('paymentMethod')?.value }} Payment Gateway...</p>
          <div class="progress mx-auto" style="height: 6px; max-width: 320px;">
            <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" style="width: 85%;"></div>
          </div>
          <div class="small text-muted mt-3">Please do not refresh or close the page.</div>
        </div>
      </div>

      <!-- State 3: Success Screen -->
      <div *ngIf="state === 'SUCCESS'" class="card shadow-lg border-0 rounded-4 text-center p-4 p-md-5">
        <div class="py-2">
          <div class="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex p-3 mb-3">
            <i class="bi bi-check-circle-fill display-4"></i>
          </div>
          <h3 class="fw-bold text-success mb-1">Money Added Successfully!</h3>
          <p class="text-muted small mb-4">Your digital wallet has been credited in real time.</p>

          <div class="card bg-light border-0 p-4 rounded-3 text-start mb-4">
            <div class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted small">Amount Added</span>
              <span class="fw-bold text-success">+₹{{ successData?.amount | number:'1.2-2' }}</span>
            </div>
            <div class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted small">Payment Method</span>
              <span class="fw-semibold text-dark">{{ successData?.paymentMethod }}</span>
            </div>
            <div class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted small">Transaction Reference</span>
              <span class="font-monospace small text-primary fw-bold">{{ successData?.referenceNumber }}</span>
            </div>
            <div class="d-flex justify-content-between py-2">
              <span class="text-muted small">Updated Wallet Balance</span>
              <span class="fw-bold text-dark fs-5">₹{{ successData?.updatedBalance | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="d-flex gap-3 justify-content-center">
            <button class="btn btn-primary px-4 py-2" (click)="resetForm()">
              <i class="bi bi-plus-lg me-1"></i> Add More Money
            </button>
            <a routerLink="/dashboard" class="btn btn-outline-secondary px-4 py-2">
              Dashboard
            </a>
            <a routerLink="/transactions/history" class="btn btn-outline-primary px-4 py-2">
              View History
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cursor-pointer { cursor: pointer; }
    .method-card { transition: all 0.2s ease; }
    .method-card:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
  `]
})
export class AddMoneyComponent implements OnInit {
  topupForm: FormGroup;
  currentBalance: number = 0;
  state: 'INPUT' | 'PROCESSING' | 'SUCCESS' = 'INPUT';
  errorMessage: string = '';
  successData: AddMoneyResponse | null = null;
  presets = [500, 1000, 2000, 5000];

  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private router: Router
  ) {
    this.topupForm = this.fb.group({
      amount: [1000, [Validators.required, Validators.min(1)]],
      paymentMethod: ['UPI', Validators.required]
    });
  }

  ngOnInit(): void {
    this.walletService.balance$.subscribe(b => this.currentBalance = b);
    this.walletService.getBalance().subscribe();
  }

  get f() { return this.topupForm.controls; }

  setAmount(val: number): void {
    this.topupForm.patchValue({ amount: val });
  }

  setMethod(method: PaymentMethod): void {
    this.topupForm.patchValue({ paymentMethod: method });
  }

  initiateTopup(): void {
    if (this.topupForm.invalid) return;

    this.state = 'PROCESSING';
    this.errorMessage = '';

    // Simulate payment gateway delay (1.5 seconds)
    setTimeout(() => {
      this.walletService.addMoney(this.topupForm.value).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.successData = res.data;
            this.state = 'SUCCESS';
          }
        },
        error: (err) => {
          this.state = 'INPUT';
          this.errorMessage = err.error?.message || 'Payment simulation failed. Please try again.';
        }
      });
    }, 1500);
  }

  resetForm(): void {
    this.topupForm.reset({ amount: 1000, paymentMethod: 'UPI' });
    this.state = 'INPUT';
    this.successData = null;
  }
}
