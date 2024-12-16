import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'env/environment';
import { TokenStorageService } from './_services/token-storage.service';

export interface PdfFile {
  sharedLink: string;
  title: string;
  year: string;
  path?: string; // Optional field
  name?: string; // Optional field
}


@Injectable({
  providedIn: 'root'
})
export class PdfLibraryService {
  private url = environment.baseUrl;
  private baseUrlLicenses = `${this.url}licenses`;
  private baseUrlMultipleLicenses = `${this.url}multiple-licenses`;
  private baseUrlPayments = `${this.url}payments`;
  private baseUrlMultiplePayments = `${this.url}multiple-payments`;

  constructor(private http: HttpClient, private tokenStorageService: TokenStorageService) {}


  private getHeaders(): HttpHeaders {
    const token = this.tokenStorageService.getToken(); // Replace with your token retrieval logic
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }
  // Fetch all files from the database
  getExistingFiles(): Observable<PdfFile[]> {
    return this.http.get<PdfFile[]>(`${this.url}lib/all`);
  }

  // Fetch and check files from Dropbox
  checkDropboxFiles(): Observable<PdfFile[]> {
    return this.http.get<PdfFile[]>(`${this.url}lib`);
  }
  getFilesFromDatabase(): Observable<PdfFile[]> {
    const endpoint = `${this.url}lib`; // Update the endpoint to fetch all files
    return this.http.get<PdfFile[]>(endpoint, { headers: this.getHeaders() });
  }


  getFilesFromBackend(): Observable<PdfFile[]> {
    return this.http.get<any[]>(`${this.url}lib`, { headers: this.getHeaders() }).pipe(
      map((response) =>
        response.map((item) => ({
          sharedLink: item.sharedLink || '',
          title: item.title || item.name || 'Unknown Title',
          year: item.year || 'Unknown Year',
          path: item.path || '',
          name: item.name || 'Unknown Name',
        }))
      ),
      catchError((error) => {
        console.error('Error fetching files from backend:', error);
        return throwError(() => error);
      })
    );
  }



  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(error);
  }
}
