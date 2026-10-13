import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, SendMoneyRequest, Transaction, PageResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  sendMoney(request: SendMoneyRequest): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(`${this.apiUrl}/send`, request);
  }

  getHistory(filters: {
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    size?: number;
  }): Observable<ApiResponse<PageResponse<Transaction>>> {
    let params = new HttpParams();
    if (filters.type) params = params.set('type', filters.type);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.minAmount !== undefined && filters.minAmount !== null) params = params.set('minAmount', filters.minAmount.toString());
    if (filters.maxAmount !== undefined && filters.maxAmount !== null) params = params.set('maxAmount', filters.maxAmount.toString());
    params = params.set('page', (filters.page ?? 0).toString());
    params = params.set('size', (filters.size ?? 10).toString());

    return this.http.get<ApiResponse<PageResponse<Transaction>>>(`${this.apiUrl}/history`, { params });
  }

  getRecent(limit: number = 5): Observable<ApiResponse<Transaction[]>> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<ApiResponse<Transaction[]>>(`${this.apiUrl}/recent`, { params });
  }

  getSummary(): Observable<ApiResponse<{ currentBalance: number; totalSent: number; totalReceived: number }>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/summary`);
  }

  getById(id: number): Observable<ApiResponse<Transaction>> {
    return this.http.get<ApiResponse<Transaction>>(`${this.apiUrl}/${id}`);
  }
}
