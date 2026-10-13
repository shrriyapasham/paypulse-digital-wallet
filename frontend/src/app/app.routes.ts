import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { DashboardComponent } from './components/user/dashboard.component';
import { AddMoneyComponent } from './components/user/add-money.component';
import { SendMoneyComponent } from './components/user/send-money.component';
import { TransactionHistoryComponent } from './components/user/transaction-history.component';
import { NotificationsComponent } from './components/user/notifications.component';
import { ProfileComponent } from './components/user/profile.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { AdminUsersComponent } from './components/admin/admin-users.component';
import { AdminTransactionsComponent } from './components/admin/admin-transactions.component';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public Routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // User Protected Routes
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'wallet/add-money', component: AddMoneyComponent, canActivate: [authGuard] },
  { path: 'transactions/send', component: SendMoneyComponent, canActivate: [authGuard] },
  { path: 'transactions/history', component: TransactionHistoryComponent, canActivate: [authGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },

  // Admin Protected Routes
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [adminGuard] },
  { path: 'admin/transactions', component: AdminTransactionsComponent, canActivate: [adminGuard] },

  // Fallbacks
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];
