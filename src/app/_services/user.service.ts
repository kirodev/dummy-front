import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'env/environment';

const API_URL = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getPublicContent(): Observable<any> {
    return this.http.get(API_URL + 'all', { responseType: 'text' });
  }

  getUserBoard(): Observable<any> {
    return this.http.get(API_URL + 'user', { responseType: 'text' });
  }

  getModeratorBoard(): Observable<any> {
    return this.http.get(API_URL + 'mod', { responseType: 'text' });
  }

  getAdminBoard(): Observable<any> {
    return this.http.get(API_URL + 'admin', { responseType: 'text' });
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(API_URL + 'user/current');
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth-token'); // Retrieve token from storage
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  changePassword(payload: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.post(`${API_URL}change-password`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

}
