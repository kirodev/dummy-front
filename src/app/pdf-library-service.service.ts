import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'env/environment';
import { TokenStorageService } from './_services/token-storage.service';

interface PdfFile {
  path: string;
  name: string;
  details?: string;
  directory_path?: string;
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
    const token = this.tokenStorageService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
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
    return this.http.head(`/assets/${path}`, { observe: 'response' }).pipe(
      map(response => response.status === 200),
      catchError(() => of(false))
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(error);
  }
}
