import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from 'env/environment';
import { TokenStorageService } from './_services/token-storage.service';

export interface AnnualRevenues {
  licensor: string;
  year: number;
  total_revenue: number;
}

export interface Payment {
  id?: number;
  mapping_id?: string;
  snippet_id?: number;
  pair_id?: number;
  licensor?: string;
  licensee?: string;
  licensee_Affiliate?: string;
  license_sales?: string;
  indication?: string;
  year?: number;
  quarter?: string;
  period_start?: string;
  period_end?: string;
  information_type?: string;
  payment_amount?: number;
  payment_amount_in_local_currency?: number;
  local_currency?: string;
  royaltyRateDollar?: number;
  royaltyRatePer?: number;
  royalty_min_dollar?: number;
  royalty_min_per?: number;
  royalty_max_dollar?: number;
  royalty_max_per?: number;
  percentage_value?: number;
  percentage_indication?: string;
  payment_type?: string;
  details?: string;
  directory_path?: string;
  document_name?: string;
  document_date?: string;
  comment?: string;
  modified?: string;
  eq_type?: string;
  equation?: string;
  eq_result?: string;
  adv_eq_type?: string;
  adv_equation?: string;
  coef?: string;
  adv_eq_type_result?: string;
  adv_eq_result?: string;
  results?: number;
  nested_eq?: string;
  nested_eq_result?: string;
  royalty_rates?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EquationsPaymentsService {
  private baseUrl = `${environment.baseUrl}payments`;
  private quarterlyRevenuesUrl = `${environment.baseUrl}quarterly_revenues`;
  private annualRevenuesUrl = `${environment.baseUrl}annual-revenues`;

  constructor(private http: HttpClient, private tokenStorageService: TokenStorageService) { }

  private getHeaders(): HttpHeaders {
    const token = this.tokenStorageService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.baseUrl, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getPayment(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  createPayment(payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(this.baseUrl, payment, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updatePayment(id: number, payment: Payment): Observable<Payment> {
    return this.http.put<Payment>(`${this.baseUrl}/payments/${id}`, payment, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deletePayment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getQuarterlyRevenue(licensor: string, year: number, quarter: string): Observable<any> {
    return this.http.get<any>(`${this.quarterlyRevenuesUrl}?licensor=${licensor}&year=${year}&quarter=${quarter}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getPaymentsWithRevenueReplacement(): Observable<Payment[]> {
    return this.getPayments().pipe(
      switchMap(payments => {
        const annualRevenueRequests = payments
          .filter(payment => payment.adv_eq_type_result === 'TRY')
          .map(payment => this.getAnnualRevenue(payment.licensor!, payment.year!));

        return forkJoin(annualRevenueRequests).pipe(
          map(revenues => {
            return payments.map(payment => {
              if (payment.adv_eq_type_result === 'TRY') {
                const matchingRevenue = revenues.find(rev =>
                  rev.licensor === payment.licensor &&
                  rev.year === payment.year
                );
                if (matchingRevenue) {
                  return {
                    ...payment,
                    adv_eq_result: matchingRevenue.total_revenue.toString()
                  };
                }
              }
              return payment;
            });
          })
        );
      }),
      catchError(this.handleError)
    );
  }

  getAnnualRevenue(licensor: string, year: number): Observable<AnnualRevenues> {
    const params = new HttpParams()
      .set('licensor', licensor)
      .set('year', year.toString());

    return this.http.get<AnnualRevenues>(this.annualRevenuesUrl, { params, headers: this.getHeaders() }).pipe(
      tap(response => console.log('Annual revenue response:', response)),
      catchError(this.handleError)
    );
  }

  getAllAnnualRevenues(): Observable<AnnualRevenues[]> {
    return this.http.get<AnnualRevenues[]>(this.annualRevenuesUrl, { headers: this.getHeaders() }).pipe(
      tap(revenues => console.log('Fetched all annual revenues:', revenues)),
      catchError(this.handleError)
    );
  }

  private parseEquationEntry(entry: string): { licensee: string, licensor: string, year: number, quarter?: string } {
    const parts = entry.split(',');
    const licensee = parts[0]?.trim() || '';
    const licensor = parts[1]?.trim() || '';
    const yearQuarter = parts[2]?.trim() || '';

    if (!yearQuarter || yearQuarter.length < 4) {
      throw new Error(`Invalid year and quarter format: ${yearQuarter}`);
    }

    const year = parseInt(yearQuarter.substring(0, 4), 10);
    const quarter = yearQuarter.substring(4) || undefined;

    return { licensee, licensor, year, quarter };
  }

  private parseEquations(advEquation: string, advEqResult: string): { licensee: string, licensor: string, year?: number, quarter?: string }[] {
    const equationEntries = advEquation.split('\n');
    return equationEntries.map((entry) => this.parseEquationEntry(entry));
  }

  private buildParams(query: { licensee: string, licensor: string, year?: number, quarter?: string }): { [key: string]: string } {
    const params: { [key: string]: string } = {
      licensee: query.licensee,
      licensor: query.licensor
    };

    if (query.year) {
      params['year'] = query.year.toString();
    }

    if (query.quarter) {
      params['quarter'] = query.quarter;
    }

    return params;
  }

  generateEquation(equationTemplate: string, data: {
    licensee: string;
    licensor: string;
    year?: number;
    quarter?: string;
  }): string {
    return equationTemplate
      .replace('[licensee]', data['licensee'])
      .replace('[licensor]', data['licensor'])
      .replace('[year]', (data['year'] ?? '').toString())
      .replace('[quarter]', data['quarter'] || '');
  }

  updatePaymentResults(payments: Payment[]): Observable<void> {
    const url = `${this.baseUrl}/update-results`;
    return this.http.put<void>(url, payments, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend error
      errorMessage = `Backend returned code ${error.status}, `;
      if (error.status === 404) {
        errorMessage += 'Endpoint not found. Please check the URL and API implementation.';
      } else {
        errorMessage += `body was: ${JSON.stringify(error.error)}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
