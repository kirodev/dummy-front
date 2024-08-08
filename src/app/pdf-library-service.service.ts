import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'env/environment';
import { TokenStorageService } from './_services/token-storage.service';

interface PdfFile {
  path: string;
  name: string;
  details?: string; // Include details if needed
}

@Injectable({
  providedIn: 'root'
})
export class PdfLibraryService {
  private url = environment.baseUrl;
  private baseUrl = `${this.url}licenses`;
  private baseUrlML = `${this.url}multiple-licenses`;

  constructor(private http: HttpClient, private tokenStorageService: TokenStorageService) {}

  private getHeaders(): HttpHeaders {
    const token = this.tokenStorageService.getToken(); // Get the JWT token from your token storage service
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Include the JWT token in the Authorization header
    });
  }

  getPdfFiles(): Observable<PdfFile[]> {
    return this.http.get<PdfFile[]>(`${this.baseUrl}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  checkFileExists(path: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrlML}?directory_path=${encodeURIComponent(path)}`);
  }
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(error);
  }
}
