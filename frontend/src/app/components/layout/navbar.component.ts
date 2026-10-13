import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { WalletService } from '../../services/wallet.service';
import { NotificationService } from '../../services/notification.service';
import { AuthResponse } from '../../models/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-3 py-2 shadow-sm" style="background-color: #0f172a !important;">
      <div class="container-fluid">
        <!-- Brand -->
        <a class="navbar-brand d-flex align-items-center gap-2 fw-bold" routerLink="/dashboard">
          <span class="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-3 p-1 px-2" style="font-size: 1.1rem;">
            <i class="bi bi-wallet2"></i>
          </span>
          <span class="tracking-wide text-white">PayPulse</span>
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle ms-1" style="font-size: 0.65rem;">WALLET</span>
        </a>

        <!-- Right Side Nav Items -->
        <div class="d-flex align-items-center gap-3 ms-auto" *ngIf="currentUser">
          <!-- Live Wallet Balance Pill -->
          <div class="d-none d-sm-flex align-items-center gap-2 bg-slate-800 px-3 py-1 rounded-pill border border-secondary border-opacity-25 text-white" style="background-color: #1e293b;">
            <i class="bi bi-cash-stack text-success"></i>
            <span class="text-secondary small">Balance:</span>
            <span class="fw-bold text-light">₹{{ (walletBalance || 0) | number:'1.2-2' }}</span>
          </div>

          <!-- Notification Bell -->
          <a routerLink="/notifications" class="position-relative text-light p-2 text-decoration-none">
            <i class="bi bi-bell fs-5"></i>
            <span *ngIf="unreadCount > 0" class="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.65rem;">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </a>

          <!-- User Menu -->
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-light d-flex align-items-center gap-2 rounded-pill px-3 py-1 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 26px; height: 26px; font-size: 0.75rem;">
                {{ currentUser.name.charAt(0).toUpperCase() }}
              </div>
              <span class="d-none d-md-inline small fw-semibold">{{ currentUser.name }}</span>
              <span *ngIf="currentUser.role === 'ADMIN'" class="badge bg-danger ms-1" style="font-size: 0.6rem;">ADMIN</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
              <li class="dropdown-header">
                <div class="fw-bold text-dark">{{ currentUser.name }}</div>
                <div class="small text-muted text-truncate" style="max-width: 180px;">{{ currentUser.email }}</div>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item d-flex align-items-center gap-2" routerLink="/profile"><i class="bi bi-person text-primary"></i> Profile</a></li>
              <li><a class="dropdown-item d-flex align-items-center gap-2" routerLink="/profile"><i class="bi bi-shield-lock text-warning"></i> Security</a></li>
              <li *ngIf="currentUser.role === 'ADMIN'"><hr class="dropdown-divider"></li>
              <li *ngIf="currentUser.role === 'ADMIN'"><a class="dropdown-item d-flex align-items-center gap-2 text-danger fw-semibold" routerLink="/admin/dashboard"><i class="bi bi-speedometer2"></i> Admin Panel</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><button class="dropdown-item d-flex align-items-center gap-2 text-danger" (click)="logout()"><i class="bi bi-box-arrow-right"></i> Sign Out</button></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: AuthResponse | null = null;
  walletBalance: number = 0;
  unreadCount: number = 0;
  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private walletService: WalletService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.refreshData();
        }
      })
    );

    this.subs.push(
      this.walletService.balance$.subscribe(bal => {
        this.walletBalance = bal;
      })
    );

    this.subs.push(
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      })
    );
  }

  refreshData(): void {
    this.walletService.getBalance().subscribe();
    this.notificationService.fetchUnreadCount().subscribe();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
