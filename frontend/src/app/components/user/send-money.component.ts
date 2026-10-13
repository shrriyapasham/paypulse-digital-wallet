import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { WalletService } from '../../services/wallet.service';
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { UserSearch, Transaction } from '../../models/models';

@Component({
  selector: 'app-send-money',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container py-4" style="max-width: 680px;">
      <!-- Title -->
      <div class="mb-4">
        <a routerLink="/dashboard" class="btn btn-sm btn-link text-decoration-none ps-0 text-muted mb-2">
          <i class="bi bi-arrow-left"></i> Back to Dashboard
        </a>
        <h3 class="fw-bold mb-1">Send Money</h3>
        <p class="text-muted small">Transfer funds directly to another registered PayPulse user.</p>
      </div>

      <!-- Step Indicator -->
      <div class="card mb-4 border-0 shadow-sm bg-white p-3 rounded-4">
        <div class="d-flex justify-content-between position-relative">
          <div class="text-center flex-fill step-item" [class.step-active]="stage === 'FORM'" [class.step-done]="stage === 'CONFIRM' || stage === 'SUCCESS'">
            <div class="step-circle mx-auto mb-1">1</div>
            <div class="step-label">Details</div>
          </div>
          <div class="text-center flex-fill step-item" [class.step-active]="stage === 'CONFIRM'" [class.step-done]="stage === 'SUCCESS'">
            <div class="step-circle mx-auto mb-1">2</div>
            <div class="step-label">Confirmation</div>
          </div>
          <div class="text-center flex-fill step-item" [class.step-active]="stage === 'SUCCESS'">
            <div class="step-circle mx-auto mb-1">3</div>
            <div class="step-label">Receipt</div>
          </div>
        </div>
      </div>

      <!-- Stage 1: Form Input -->
      <div *ngIf="stage === 'FORM'" class="card shadow-sm border-0 rounded-4">
        <div class="card-body p-4 p-md-5">
          <!-- Balance info -->
          <div class="d-flex justify-content-between align-items-center bg-light p-3 rounded-3 mb-4">
            <div>
              <span class="text-muted small">Available Balance</span>
              <h4 class="fw-bold text-dark mb-0">₹{{ currentBalance | number:'1.2-2' }}</h4>
            </div>
            <a routerLink="/wallet/add-money" class="btn btn-sm btn-outline-primary rounded-pill">
              <i class="bi bi-plus-lg"></i> Add Money
            </a>
          </div>

          <!-- Error Alert -->
          <div *ngIf="errorMessage" class="alert alert-danger py-2 px-3 small rounded-3 mb-3">
            <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ errorMessage }}
          </div>

          <form [formGroup]="sendForm" (ngSubmit)="proceedToConfirm()">
            <!-- Step 1: Recipient Search & Input -->
            <div class="mb-3">
              <label class="form-label small fw-semibold text-secondary">Step 1: Recipient Phone or Email</label>
              <div class="input-group">
                <span class="input-group-text bg-white text-muted"><i class="bi bi-person-search"></i></span>
                <input type="text" class="form-control" placeholder="Search by email or phone (e.g. user2@wallet.com)"
                       formControlName="recipientIdentifier" (input)="onSearchInput($event)"
                       [class.is-invalid]="f['recipientIdentifier'].touched && f['recipientIdentifier'].invalid">
              </div>
              <div *ngIf="f['recipientIdentifier'].touched && f['recipientIdentifier'].invalid" class="text-danger small mt-1">
                Recipient email or phone is required.
              </div>

              <!-- Live Search Dropdown Suggestions -->
              <div *ngIf="searchResults.length > 0" class="list-group mt-2 shadow-sm border rounded-3 overflow-hidden">
                <button type="button" *ngFor="let user of searchResults"
                        (click)="selectRecipient(user)"
                        class="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-2 px-3">
                  <div>
                    <div class="fw-bold small text-dark">{{ user.name }}</div>
                    <div class="text-muted" style="font-size: 0.72rem;">{{ user.maskedEmail }} • {{ user.maskedPhone }}</div>
                  </div>
                  <span class="badge bg-primary-subtle text-primary rounded-pill small">Select</span>
                </button>
              </div>

              <!-- Selected Verified Recipient Badge -->
              <div *ngIf="selectedRecipientName" class="alert alert-success mt-2 py-2 px-3 small d-flex align-items-center justify-content-between rounded-3">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-check-circle-fill text-success"></i>
                  <span>Verified Recipient: <strong>{{ selectedRecipientName }}</strong></span>
                </div>
                <button type="button" class="btn-close btn-sm" (click)="selectedRecipientName = ''"></button>
              </div>
            </div>

            <!-- Step 2: Amount -->
            <div class="mb-3">
              <label class="form-label small fw-semibold text-secondary">Step 2: Transfer Amount (₹)</label>
              <div class="input-group input-group-lg">
                <span class="input-group-text bg-white fw-bold text-muted">₹</span>
                <input type="number" class="form-control fw-bold fs-4" placeholder="1000"
                       formControlName="amount" [class.is-invalid]="f['amount'].touched && f['amount'].invalid">
              </div>
              <div *ngIf="f['amount'].touched && f['amount'].invalid" class="text-danger small mt-1">
                Please enter a valid amount greater than ₹0 and not exceeding your available balance.
              </div>

              <!-- Quick Presets -->
              <div class="d-flex flex-wrap gap-2 mt-2">
                <button *ngFor="let p of [100, 500, 1000, 2000]" type="button"
                        (click)="sendForm.patchValue({ amount: p })"
                        class="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1">
                  ₹{{ p }}
                </button>
              </div>
            </div>

            <!-- Step 3: Description -->
            <div class="mb-4">
              <label class="form-label small fw-semibold text-secondary">Step 3: Description / Note (Optional)</label>
              <input type="text" class="form-control" placeholder="e.g. Project share, dinner expense..."
                     formControlName="description">
            </div>

            <button type="submit" [disabled]="sendForm.invalid || f['amount'].value > currentBalance"
                    class="btn btn-primary w-100 py-3 fw-semibold shadow-sm">
              Review & Confirm Transfer &rarr;
            </button>
            <div *ngIf="f['amount'].value > currentBalance" class="text-danger small text-center mt-2">
              <i class="bi bi-exclamation-circle"></i> Amount exceeds current wallet balance.
            </div>
          </form>
        </div>
      </div>

      <!-- Stage 2: Confirmation Screen (Requirement 17 Step 5) -->
      <div *ngIf="stage === 'CONFIRM'" class="card shadow-sm border-0 rounded-4">
        <div class="card-body p-4 p-md-5">
          <div class="text-center mb-4">
            <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex p-3 mb-2">
              <i class="bi bi-shield-check display-6"></i>
            </div>
            <h4 class="fw-bold mb-1">Confirm Money Transfer</h4>
            <p class="text-muted small">Please verify the transfer breakdown before authorizing.</p>
          </div>

          <!-- Error Alert -->
          <div *ngIf="errorMessage" class="alert alert-danger py-2 px-3 small rounded-3 mb-3">
            <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ errorMessage }}
          </div>

          <!-- Breakdown Receipt Card -->
          <div class="card bg-light border-0 p-4 rounded-3 mb-4">
            <div class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted small">Recipient</span>
              <span class="fw-bold text-dark">{{ selectedRecipientName || sendForm.get('recipientIdentifier')?.value }}</span>
            </div>
            <div class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted small">Recipient Identifier</span>
              <span class="font-monospace small text-muted">{{ sendForm.get('recipientIdentifier')?.value }}</span>
            </div>
            <div class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted small">Transfer Amount</span>
              <span class="fw-bold text-danger fs-5">-₹{{ sendForm.get('amount')?.value | number:'1.2-2' }}</span>
            </div>
            <div class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted small">Current Balance</span>
              <span class="fw-semibold text-dark">₹{{ currentBalance | number:'1.2-2' }}</span>
            </div>
            <div class="d-flex justify-content-between py-2">
              <span class="text-muted small">Remaining Balance</span>
              <span class="fw-bold text-success fs-5">₹{{ (currentBalance - sendForm.get('amount')?.value) | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="d-flex gap-3">
            <button type="button" class="btn btn-outline-secondary flex-fill py-2" (click)="stage = 'FORM'" [disabled]="loading">
              CANCEL
            </button>
            <button type="button" class="btn btn-primary flex-fill py-2 fw-semibold" (click)="executeTransfer()" [disabled]="loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Processing Transfer...' : 'CONFIRM TRANSFER' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Stage 3: Success Screen (Requirement 17 Final) -->
      <div *ngIf="stage === 'SUCCESS'" class="card shadow-lg border-0 rounded-4 text-center p-4 p-md-5">
        <div class="py-2">
          <div class="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex p-3 mb-3">
            <i class="bi bi-check-circle-fill display-4"></i>
          </div>
          <h3 class="fw-bold text-success mb-1">✓ Transaction Successful</h3>
          <p class="text-muted small mb-4">
            ₹{{ successTxn?.amount | number:'1.2-2' }} sent successfully to {{ successTxn?.receiverName || 'Recipient' }}.
          </p>

          <div class="card bg-light border-0 p-4 rounded-3 text-start mb-4">
            <div class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted small">Recipient</span>
              <span class="fw-bold text-dark">{{ successTxn?.receiverName }}</span>
            </div>
            <div class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted small">Amount Sent</span>
              <span class="fw-bold text-danger">-₹{{ successTxn?.amount | number:'1.2-2' }}</span>
            </div>
            <div class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted small">Reference Number</span>
              <span class="font-monospace small text-primary fw-bold">{{ successTxn?.referenceNumber }}</span>
            </div>
            <div class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted small">Status</span>
              <span class="badge badge-success-soft badge-status">{{ successTxn?.status }}</span>
            </div>
            <div class="d-flex justify-content-between py-2">
              <span class="text-muted small">Date & Time</span>
              <span class="small text-muted">{{ successTxn?.transactionDate | date:'medium' }}</span>
            </div>
          </div>

          <div class="d-flex gap-3 justify-content-center">
            <button class="btn btn-primary px-4 py-2" (click)="resetForm()">
              <i class="bi bi-send me-1"></i> Send Another Payment
            </button>
            <a [routerLink]="['/transactions', successTxn?.transactionId]" class="btn btn-outline-primary px-4 py-2">
              View Transaction
            </a>
            <a routerLink="/dashboard" class="btn btn-outline-secondary px-4 py-2">
              Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .step-item { position: relative; }
    .step-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.85rem;
    }
    .step-label { font-size: 0.75rem; color: #64748b; font-weight: 500; }
    .step-active .step-circle { background: #2563eb; color: #ffffff; box-shadow: 0 0 0 3px rgba(37,99,235,0.2); }
    .step-active .step-label { color: #2563eb; font-weight: 700; }
    .step-done .step-circle { background: #10b981; color: #ffffff; }
  `]
})
export class SendMoneyComponent implements OnInit {
  sendForm: FormGroup;
  currentBalance: number = 0;
  stage: 'FORM' | 'CONFIRM' | 'SUCCESS' = 'FORM';
  loading: boolean = false;
  errorMessage: string = '';
  searchResults: UserSearch[] = [];
  selectedRecipientName: string = '';
  successTxn: Transaction | null = null;
  private searchSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private transactionService: TransactionService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
    this.sendForm = this.fb.group({
      recipientIdentifier: ['', [Validators.required]],
      amount: [1000, [Validators.required, Validators.min(1)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.walletService.balance$.subscribe(b => this.currentBalance = b);
    this.walletService.getBalance().subscribe();

    // Debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.trim().length < 2) {
          return of({ success: true, message: '', data: [] as UserSearch[] });
        }
        return this.userService.searchUsers(query.trim());
      })
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.searchResults = res.data;
        }
      }
    });
  }

  get f() { return this.sendForm.controls; }

  onSearchInput(event: any): void {
    const val = event.target.value;
    this.searchSubject.next(val);
  }

  selectRecipient(user: UserSearch): void {
    this.selectedRecipientName = user.name;
    // Fill the identifier with either email if known or the value
    this.sendForm.patchValue({ recipientIdentifier: user.maskedEmail.replace(/\*/g, '') });
    this.searchResults = [];
  }

  proceedToConfirm(): void {
    if (this.sendForm.invalid) return;

    if (this.sendForm.get('amount')?.value > this.currentBalance) {
      this.errorMessage = 'Insufficient balance in wallet.';
      return;
    }

    this.errorMessage = '';
    this.stage = 'CONFIRM';
  }

  executeTransfer(): void {
    this.loading = true;
    this.errorMessage = '';

    this.transactionService.sendMoney(this.sendForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.successTxn = res.data;
          this.stage = 'SUCCESS';
          // Refresh balance
          this.walletService.getBalance().subscribe();
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Transfer failed. Please check recipient and balance.';
      }
    });
  }

  resetForm(): void {
    this.sendForm.reset({ amount: 1000, description: '' });
    this.selectedRecipientName = '';
    this.stage = 'FORM';
    this.successTxn = null;
  }
}
