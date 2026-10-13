import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, AuthResponse, User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getStoredUser(): AuthResponse | null {
    const userJson = localStorage.getItem('wallet_user');
    return userJson ? JSON.parse(userJson) : null;
  }

  public get currentUserValue(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  register(data: any): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  private setSession(authData: AuthResponse): void {
    localStorage.setItem('wallet_token', authData.token);
    localStorage.setItem('wallet_user', JSON.stringify(authData));
    this.currentUserSubject.next(authData);
  }

  logout(): void {
    localStorage.removeItem('wallet_token');
    localStorage.removeItem('wallet_user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('wallet_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUserValue;
  }

  isAdmin(): boolean {
    return this.currentUserValue?.role === 'ADMIN';
  }

  updateStoredUser(user: Partial<AuthResponse>): void {
    if (this.currentUserSubject.value) {
      const updated = { ...this.currentUserSubject.value, ...user };
      localStorage.setItem('wallet_user', JSON.stringify(updated));
      this.currentUserSubject.next(updated);
    }
  }
}
