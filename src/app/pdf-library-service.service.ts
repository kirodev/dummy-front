import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'env/environment';
import { TokenStorageService } from './_services/token-storage.service';

export interface PdfFile {
sharedLink: string;
  title: any;
  year: any;
  path: string;
  name: string;
  details?: string;
  directory_path?: string;
  type?: string; // Added 'type' property

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

  getExistingFiles(): Observable<PdfFile[]> {
    return this.http.get<PdfFile[]>(`${this.url}lib/all`, {
      headers: this.getHeaders(),
    }).pipe(
      catchError(this.handleError)
    );
  }


    // Fetch all files from the database

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



  getFilesFromFolder(folderPath: string = '/CLOUD STRUCTURE/Data library'): Observable<PdfFile[]> {
    const endpoint = `${this.url}lib?folderPath=${encodeURIComponent(folderPath)}`;
    return this.http.get<PdfFile[]>(endpoint, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  checkDropboxFiles(folderPath?: string): Observable<PdfFile[]> {
    let url = `${this.url}lib/sync`;
    if (folderPath) {
      url += `?folderPath=${encodeURIComponent(folderPath)}`;
    }
    return this.http.get<PdfFile[]>(url, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error('Error fetching Dropbox files:', err);
        return throwError(() => err);
      })
    );
  }

  getPdfFilesFromAllTables(): Observable<PdfFile[]> {
    const licenses$ = this.http.get<PdfFile[]>(`${this.baseUrlLicenses}`, { headers: this.getHeaders() });
    const multipleLicenses$ = this.http.get<PdfFile[]>(`${this.baseUrlMultipleLicenses}`, { headers: this.getHeaders() });
    const payments$ = this.http.get<PdfFile[]>(`${this.baseUrlPayments}`, { headers: this.getHeaders() });
    const multiplePayments$ = this.http.get<PdfFile[]>(`${this.baseUrlMultiplePayments}`, { headers: this.getHeaders() });

    return forkJoin([licenses$, multipleLicenses$, payments$, multiplePayments$]).pipe(
      map(([licenses, multipleLicenses, payments, multiplePayments]: [PdfFile[], PdfFile[], PdfFile[], PdfFile[]]) => {
        return [...licenses, ...multipleLicenses, ...payments, ...multiplePayments];
      }),
      catchError(this.handleError)
    );
  }

  checkFileExistsInAllTables(path: string): Observable<boolean> {
    const encodedPath = encodeURIComponent(path);
    console.log(`Encoded path: ${encodedPath}`);

    const licensesCheck$ = this.http.get<boolean>(
      `${this.baseUrlLicenses}?directory_path=${encodedPath}`,
      { headers: this.getHeaders() }
    );

    const multipleLicensesCheck$ = this.http.get<boolean>(
      `${this.baseUrlMultipleLicenses}?directory_path=${encodedPath}`,
      { headers: this.getHeaders() }
    );

    const paymentsCheck$ = this.http.get<boolean>(
      `${this.baseUrlPayments}?directory_path=${encodedPath}`,
      { headers: this.getHeaders() }
    );

    const multiplePaymentsCheck$ = this.http.get<boolean>(
      `${this.baseUrlMultiplePayments}?directory_path=${encodedPath}`,
      { headers: this.getHeaders() }
    );

    return forkJoin([licensesCheck$, multipleLicensesCheck$, paymentsCheck$, multiplePaymentsCheck$]).pipe(
      map(([existsInLicenses, existsInMultipleLicenses, existsInPayments, existsInMultiplePayments]: [boolean, boolean, boolean, boolean]) => {
        console.log(`Exists in licenses: ${existsInLicenses}, exists in multiple licenses: ${existsInMultipleLicenses}, exists in payments: ${existsInPayments}, exists in multiple payments: ${existsInMultiplePayments}`);
        return existsInLicenses || existsInMultipleLicenses || existsInPayments || existsInMultiplePayments;
      }),
      catchError(this.handleError)
    );
  }

  checkFileExistsInAssets(path: string): Observable<boolean> {
    // Normalize the path to use forward slashes
    const normalizedPath = path.replace(/\\/g, '/');
    return this.http.head(`/assets/${normalizedPath}`, { observe: 'response' }).pipe(
      map(response => response.status === 200),
      catchError(() => of(false))
    );
  }


  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(error);
  }
}
