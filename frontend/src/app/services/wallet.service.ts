import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, WalletBalance, AddMoneyRequest, AddMoneyResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = `${environment.apiUrl}/wallet`;
  private balanceSubject = new BehaviorSubject<number>(0);
  public balance$ = this.balanceSubject.asObservable();

  constructor(private http: HttpClient) {}

  getBalance(): Observable<ApiResponse<WalletBalance>> {
    return this.http.get<ApiResponse<WalletBalance>>(`${this.apiUrl}/balance`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.balanceSubject.next(res.data.balance);
        }
      })
    );
  }

  addMoney(request: AddMoneyRequest): Observable<ApiResponse<AddMoneyResponse>> {
    return this.http.post<ApiResponse<AddMoneyResponse>>(`${this.apiUrl}/add-money`, request).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.balanceSubject.next(res.data.updatedBalance);
        }
      })
    );
  }

  getTopups(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/topups`);
  }

  updateBalanceLocally(newBalance: number): void {
    this.balanceSubject.next(newBalance);
  }
}
