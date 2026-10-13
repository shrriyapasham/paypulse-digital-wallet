import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { NotificationItem, PageResponse } from '../../models/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4" style="max-width: 800px;">
      <!-- Header -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 class="fw-bold mb-1">Notifications & Activity Alerts</h3>
          <p class="text-muted small mb-0">Live alerts for logins, wallet top-ups, transfers, and security events.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary" (click)="markAllAsRead()" [disabled]="notifications.length === 0">
            <i class="bi bi-check2-all me-1"></i> Mark All as Read
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div class="card-body p-0">
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="small text-muted mt-2">Loading alerts...</p>
          </div>

          <div *ngIf="!loading && notifications.length === 0" class="text-center py-5">
            <i class="bi bi-bell-slash text-muted display-4 opacity-50"></i>
            <h5 class="fw-bold mt-3">No Notifications</h5>
            <p class="text-muted small">You're all caught up! New alerts will show up here.</p>
          </div>

          <div *ngIf="!loading && notifications.length > 0" class="list-group list-group-flush">
            <div *ngFor="let notif of notifications"
                 class="list-group-item p-3 d-flex align-items-start gap-3 transition-all"
                 [class.bg-white]="notif.isRead"
                 [class.bg-primary-subtle]="!notif.isRead">
              <!-- Icon -->
              <div class="rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                   [ngClass]="notif.isRead ? 'bg-light text-secondary' : 'bg-primary text-white'"
                   style="width: 36px; height: 36px;">
                <i class="bi" [ngClass]="getIconForMessage(notif.message)"></i>
              </div>

              <!-- Message Text -->
              <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-start">
                  <p class="mb-1 text-dark" [class.fw-bold]="!notif.isRead" [class.fw-normal]="notif.isRead" style="font-size: 0.9rem;">
                    {{ notif.message }}
                  </p>
                  <span *ngIf="!notif.isRead" class="badge bg-primary rounded-pill small ms-2">NEW</span>
                </div>
                <div class="text-muted" style="font-size: 0.75rem;">
                  <i class="bi bi-clock me-1"></i> {{ notif.createdAt | date:'medium' }}
                </div>
              </div>

              <!-- Mark Read Button -->
              <div *ngIf="!notif.isRead">
                <button class="btn btn-sm btn-link text-decoration-none text-primary p-0"
                        title="Mark as read"
                        (click)="markAsRead(notif)">
                  <i class="bi bi-check-lg fs-5"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div *ngIf="pageData && pageData.totalPages > 1" class="d-flex justify-content-between align-items-center p-3 border-top">
            <span class="text-muted small">Page {{ currentPage + 1 }} of {{ pageData.totalPages }}</span>
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
export class NotificationsComponent implements OnInit {
  notifications: NotificationItem[] = [];
  pageData: PageResponse<NotificationItem> | null = null;
  currentPage: number = 0;
  loading: boolean = false;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications(this.currentPage, 15).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.pageData = res.data;
          this.notifications = res.data.content;
        }
      },
      error: () => this.loading = false
    });
  }

  markAsRead(notif: NotificationItem): void {
    this.notificationService.markAsRead(notif.notificationId).subscribe({
      next: () => {
        notif.isRead = true;
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
      }
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadNotifications();
  }

  getIconForMessage(msg: string): string {
    const lower = msg.toLowerCase();
    if (lower.includes('credited') || lower.includes('received')) return 'bi-arrow-down-left';
    if (lower.includes('sent') || lower.includes('transferred')) return 'bi-arrow-up-right';
    if (lower.includes('login')) return 'bi-shield-lock';
    if (lower.includes('blocked')) return 'bi-exclamation-octagon';
    return 'bi-bell';
  }
}
