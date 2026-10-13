export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export type Role = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BLOCKED';
export type TransactionType = 'ADD_MONEY' | 'TRANSFER' | 'REFUND';
export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'PENDING';
export type PaymentMethod = 'UPI' | 'CARD' | 'NET_BANKING';

export interface User {
  userId: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: UserStatus;
  createdAt?: string;
  walletBalance?: number;
  walletId?: number;
}

export interface UserSearch {
  userId: number;
  name: string;
  maskedEmail: string;
  maskedPhone: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: UserStatus;
}

export interface WalletBalance {
  walletId: number;
  userId: number;
  balance: number;
  updatedAt: string;
}

export interface AddMoneyRequest {
  amount: number;
  paymentMethod: PaymentMethod;
}

export interface AddMoneyResponse {
  referenceNumber: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  updatedBalance: number;
  transactionDate: string;
}

export interface SendMoneyRequest {
  recipientIdentifier: string;
  amount: number;
  description?: string;
}

export interface Transaction {
  transactionId: number;
  referenceNumber: string;
  senderId?: number;
  senderName?: string;
  senderEmail?: string;
  receiverId?: number;
  receiverName?: string;
  receiverEmail?: string;
  amount: number;
  transactionType: TransactionType;
  status: TransactionStatus;
  description?: string;
  transactionDate: string;
  direction?: 'SENT' | 'RECEIVED' | 'TOP_UP';
}

export interface NotificationItem {
  notificationId: number;
  userId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalWalletBalance: number;
  totalMoneyTransferred: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
