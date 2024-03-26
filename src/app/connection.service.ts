import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  private baseUrl = 'http://localhost:8080';
  private tableData: string[][] = [];
  private cellColors: { row: number; col: number; color: string }[] = [];

  constructor(private http: HttpClient) {}


  getData(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/data`).pipe(
      catchError(this.handleError)
    );
  }

  getLicenseById(id: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createLicense(license: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, license).pipe(
      catchError(this.handleError)
    );
  }

  updateLicense(id: any, license: any): Observable<any> {
    const modifiedValue = license.licensee === 'Unknown' ? id : null; 
    const body = { ...license, modified: modifiedValue };
  
    return this.http.put<any>(`http://localhost:8080/${id}`, body);
  }



  
  
  undoUpdateLicensee(id: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/undo`, {});
  }
  
  deleteLicense(id: any): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
  
  getTableData(): string[][] {
    return this.tableData;
  }

  setTableData(data: string[][]): void {
    this.tableData = data;
  }

  getCellColors(): { row: number; col: number; color: string }[] {
    return this.cellColors;
  }

  setCellColors(colors: { row: number; col: number; color: string }[]): void {
    this.cellColors = colors;
  }




  updateDetails(id: number, updatedDetails: string): Observable<any> {
    const url = `${this.baseUrl}/${id}/details`;
    const params = new HttpParams().set('details', updatedDetails); // Send updatedDetails as a request parameter
    return this.http.put(url, {}, { params }); // Send an empty request body since details are sent as a parameter
}


  getPaymentAmountData(): Observable<number[]> {
    return this.http.get<any[]>(`${this.baseUrl}/data`).pipe(map((response: any[]) => {

        return response.map(entry => entry.payment_amount);
      }),
      catchError(this.handleError)
    );
  }
  getMultipleLicensees(): Observable<any[]> {
    // Assuming you have an API endpoint to fetch multiple licensees data
    return this.http.get<any[]>(`${this.baseUrl}/multiple-licensees`);
  }

  updateKnownLicensees(id: any, knownLicensee: string): Observable<any> {
    // Assuming you have an API endpoint to update known licensees data
    return this.http.put<any>(`${this.baseUrl}/multiple-licensees/${id}`, { knownLicensee });
  }


  getLicensees(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/licensees`).pipe(
      catchError(this.handleError)
    );
  }
    // Define a method to fetch distinct licensee names from the server
    getDistinctLicensees(): Observable<string[]> {
      return this.http.get<string[]>('/licensees'); // Replace '/api/distinct/licensees' with your actual API endpoint
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
  
}
