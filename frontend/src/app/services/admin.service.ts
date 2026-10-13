import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, AdminDashboardStats, User, Transaction, PageResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<ApiResponse<AdminDashboardStats>> {
    return this.http.get<ApiResponse<AdminDashboardStats>>(`${this.apiUrl}/dashboard`);
  }

  getUsers(filters: { search?: string; role?: string; status?: string; page?: number; size?: number }): Observable<ApiResponse<PageResponse<User>>> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.role) params = params.set('role', filters.role);
    if (filters.status) params = params.set('status', filters.status);
    params = params.set('page', (filters.page ?? 0).toString());
    params = params.set('size', (filters.size ?? 10).toString());

    return this.http.get<ApiResponse<PageResponse<User>>>(`${this.apiUrl}/users`, { params });
  }

  getUserById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/users/${id}`);
  }

  blockUser(id: number): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/users/${id}/block`, {});
  }

  unblockUser(id: number): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/users/${id}/unblock`, {});
  }

  getTransactions(filters: { search?: string; type?: string; status?: string; page?: number; size?: number }): Observable<ApiResponse<PageResponse<Transaction>>> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.type) params = params.set('type', filters.type);
    if (filters.status) params = params.set('status', filters.status);
    params = params.set('page', (filters.page ?? 0).toString());
    params = params.set('size', (filters.size ?? 10).toString());

    return this.http.get<ApiResponse<PageResponse<Transaction>>>(`${this.apiUrl}/transactions`, { params });
  }
}
