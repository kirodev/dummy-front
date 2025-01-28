import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'env/environment';
import { TokenStorageService } from './token-storage.service';

const API_URL = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient, private tokenStorageService : TokenStorageService) {}

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
    const token = localStorage.getItem('auth-token'); // Retrieve the token
    if (!token) {
      console.error('Auth token is missing');
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }


  changePassword(payload: { currentPassword: string; newPassword: string }): Observable<any> {
    const token = this.tokenStorageService.getToken();
    if (!token) {
      console.error('Auth token is missing');
      return new Observable((observer) => {
        observer.error({ error: { message: 'Auth token is missing. Please log in again.' } });
      });
    }

    return this.http.post(`${API_URL}change-password`, payload, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    });
  }


}
