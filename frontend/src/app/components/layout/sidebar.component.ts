import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthResponse } from '../../models/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="d-flex flex-column flex-shrink-0 p-3 text-white h-100" style="background-color: #0f172a; min-height: calc(100vh - 58px);">
      <div class="px-2 mb-3 text-uppercase text-secondary fw-bold" style="font-size: 0.7rem; letter-spacing: 0.05em;">
        Main Menu
      </div>

      <ul class="nav nav-pills flex-column mb-auto gap-1">
        <li class="nav-item">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link text-white d-flex align-items-center gap-3 py-2 px-3 rounded-3">
            <i class="bi bi-grid-fill text-primary"></i>
            <span>Dashboard</span>
          </a>
        </li>
        <li>
          <a routerLink="/wallet/add-money" routerLinkActive="active" class="nav-link text-white d-flex align-items-center gap-3 py-2 px-3 rounded-3">
            <i class="bi bi-plus-circle-fill text-success"></i>
            <span>Add Money</span>
          </a>
        </li>
        <li>
          <a routerLink="/transactions/send" routerLinkActive="active" class="nav-link text-white d-flex align-items-center gap-3 py-2 px-3 rounded-3">
            <i class="bi bi-send-fill text-info"></i>
            <span>Send Money</span>
          </a>
        </li>
        <li>
          <a routerLink="/transactions/history" routerLinkActive="active" class="nav-link text-white d-flex align-items-center gap-3 py-2 px-3 rounded-3">
            <i class="bi bi-clock-history text-warning"></i>
            <span>Transaction History</span>
          </a>
        </li>
        <li>
          <a routerLink="/notifications" routerLinkActive="active" class="nav-link text-white d-flex align-items-center gap-3 py-2 px-3 rounded-3">
            <i class="bi bi-bell-fill text-danger"></i>
            <span>Notifications</span>
          </a>
        </li>
        <li>
          <a routerLink="/profile" routerLinkActive="active" class="nav-link text-white d-flex align-items-center gap-3 py-2 px-3 rounded-3">
            <i class="bi bi-person-badge-fill text-light"></i>
            <span>Profile & Security</span>
          </a>
        </li>

        <!-- Administrator Section -->
        <ng-container *ngIf="currentUser?.role === 'ADMIN'">
          <li class="my-3 border-top border-secondary border-opacity-25"></li>
          <div class="px-2 mb-2 text-uppercase text-danger fw-bold d-flex align-items-center gap-2" style="font-size: 0.7rem; letter-spacing: 0.05em;">
            <i class="bi bi-shield-shaded"></i> Administration
          </div>
          <li>
            <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-link text-white d-flex align-items-center gap-3 py-2 px-3 rounded-3">
              <i class="bi bi-speedometer2 text-danger"></i>
              <span>Admin Overview</span>
            </a>
          </li>
          <li>
            <a routerLink="/admin/users" routerLinkActive="active" class="nav-link text-white d-flex align-items-center gap-3 py-2 px-3 rounded-3">
              <i class="bi bi-people-fill text-primary"></i>
              <span>User Management</span>
            </a>
          </li>
          <li>
            <a routerLink="/admin/transactions" routerLinkActive="active" class="nav-link text-white d-flex align-items-center gap-3 py-2 px-3 rounded-3">
              <i class="bi bi-receipt-cutoff text-success"></i>
              <span>All Transactions</span>
            </a>
          </li>
        </ng-container>
      </ul>

      <!-- App Version Info / Viva badge -->
      <div class="mt-auto pt-3 border-top border-secondary border-opacity-25 px-2">
        <div class="small text-secondary fw-semibold">PayPulse Digital Wallet</div>
        <div class="text-secondary" style="font-size: 0.7rem;">BTech CSE Major Project</div>
      </div>
    </div>
  `,
  styles: [`
    .nav-link {
      font-size: 0.9rem;
      font-weight: 500;
      color: #cbd5e1 !important;
      transition: all 0.2s ease;
    }
    .nav-link:hover {
      background-color: #1e293b;
      color: #ffffff !important;
      transform: translateX(4px);
    }
    .nav-link.active {
      background-color: #2563eb !important;
      color: #ffffff !important;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
    }
  `]
})
export class SidebarComponent implements OnInit {
  currentUser: AuthResponse | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => this.currentUser = u);
  }
}
