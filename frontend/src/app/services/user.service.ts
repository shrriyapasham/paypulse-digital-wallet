import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, User, UserSearch } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/profile`);
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/change-password`, data);
  }

  searchUsers(query: string): Observable<ApiResponse<UserSearch[]>> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ApiResponse<UserSearch[]>>(`${this.apiUrl}/search`, { params });
  }
}
