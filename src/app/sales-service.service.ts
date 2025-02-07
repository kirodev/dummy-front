import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { TokenStorageService } from './_services/token-storage.service';
import { environment } from 'env/environment';

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  constructor(private http: HttpClient, private tokenStorageService: TokenStorageService) {}
  private   url = environment.baseUrl;
  private baseUrl = this.url +'sales';
  private baseTUrl = this.url +'tablets-sales';
  private getHeaders(): HttpHeaders {
    const token = this.tokenStorageService.getToken(); // Get the JWT token from your token storage service
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Include the JWT token in the Authorization header
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }

  getAllSales(): Observable<any[]> {
    const headers = this.getHeaders(); // Get the headers including the JWT token
    return this.http.get<any[]>(`${this.baseUrl}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getAllTabletSales(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${this.baseTUrl}`, { headers }).pipe(
      catchError(this.handleError)
    );  }

    getSalesForLicensee(licensee: string): Observable<any[]> {
      const headers = this.getHeaders();
      return this.http.get<any[]>(`${this.baseUrl}?licensee=${encodeURIComponent(licensee)}`, { headers }).pipe(
        catchError(this.handleError)
      );
    }

}
