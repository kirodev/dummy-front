import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'env/environment';
import { TokenStorageService } from './_services/token-storage.service';

export interface Equation {
  id?: number;
  snippetId: number;
  licensor?: string;
  licensee?: string;
  year?: number;
  yearlyQuarters?: string;
  details?: string;
  eqType?: string;
  equation?: string;
  eqResult?: number;
  advEqType?: string;
  advEquation?: string;
  coef?: number;
  advEqTypeResult?: string;
  advEqResult?: string;
  royaltyRates?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EquationsPaymentsService {

  private url = environment.baseUrl;
  private baseUrl = this.url + 'equations';
  private paymentsUrl = this.url + 'payments';
  private quarterlyRevenuesUrl = this.url + 'quarterly-revenues';
  private annualRevenuesUrl = this.url + 'annual-revenues';

  constructor(private http: HttpClient, private tokenStorageService: TokenStorageService) { }

  private getHeaders(): HttpHeaders {
    const token = this.tokenStorageService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getEquations(): Observable<Equation[]> {
    return this.http.get<Equation[]>(this.baseUrl, { headers: this.getHeaders() });
  }

  getEquation(id: number): Observable<Equation> {
    return this.http.get<Equation>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  createEquation(equation: Equation): Observable<Equation> {
    return this.http.post<Equation>(this.baseUrl, equation, { headers: this.getHeaders() });
  }

  updateEquation(id: number, equation: Equation): Observable<Equation> {
    return this.http.put<Equation>(`${this.baseUrl}/${id}`, equation, { headers: this.getHeaders() });
  }

  deleteEquation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  getEquationData(equation: Equation): Observable<any> {
    if (!equation.advEquation || !equation.advEqResult || !equation.advEqTypeResult) {
        return new Observable(observer => observer.next(null)); // Handle null or empty values clearly
    }

    const queries = this.parseEquations(equation.advEquation, equation.advEqResult);

    return forkJoin(
        queries.map(query => this.queryDatabase(query, equation.advEqTypeResult!, equation.eqType!))
    ).pipe(
        map(results => {
            return results.flat();
        })
    );
}

private parseEquationEntry(entry: string): { licensee: string, licensor: string, year: number, quarter?: string } {
  // Split the entry based on commas
  const parts = entry.split(',');

  // Ensure each part exists before trimming
  const licensee = parts[0]?.trim() || '';
  const licensor = parts[1]?.trim() || '';
  const yearQuarter = parts[2]?.trim() || '';

  if (!yearQuarter || yearQuarter.length < 4) {
      throw new Error(`Invalid year and quarter format: ${yearQuarter}`);
  }

  // Separate the year and quarter
  const year = parseInt(yearQuarter.substring(0, 4), 10); // First 4 characters are the year
  const quarter = yearQuarter.substring(4) || undefined; // Remaining characters are the quarter, or undefined if not present

  return { licensee, licensor, year, quarter };
}



private parseEquations(advEquation: string, advEqResult: string): { licensee: string, licensor: string, year?: number, quarter?: string }[] {
  const equationEntries = advEquation.split('\n');

  return equationEntries.map((entry) => this.parseEquationEntry(entry));
}




private queryDatabase(query: { licensee: string, licensor: string, year?: number, quarterlyQuarters?: string }, advEqTypeResult: string, eqType: string): Observable<any> {
  const headers = this.getHeaders();

  if (advEqTypeResult === 'TRA' || advEqTypeResult === 'TRQ') {
      const url = advEqTypeResult === 'TRA' ? this.annualRevenuesUrl : this.quarterlyRevenuesUrl;

      const params = this.buildParams(query);

      return this.http.get<any[]>(url, { headers, params }).pipe(
          map(response => response.map(record => record.total_revenue))
      );
  } else if (eqType === 'TPA' || eqType === 'TPQ') {
      const params = this.buildParams(query);

      return this.http.get<any[]>(this.paymentsUrl, { headers, params }).pipe(
          map(response => response.map(record => record.payment_amount))
      );
  } else {
      return new Observable(observer => observer.next([]));
  }
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
    year?: number; // Make year optional
    quarter?: string;
}): string {
    return equationTemplate
        .replace('[licensee]', data.licensee)
        .replace('[licensor]', data.licensor)
        .replace('[year]', data.year?.toString() || '') // Handle optional year
        .replace('[quarter]', data.quarter || ''); // Replace with an empty string if quarter is missing
}

}
