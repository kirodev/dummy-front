import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class PaymentConnection {

  constructor(private http: HttpClient) {}

  private baseUrl = 'http://localhost:8080';


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

  updateDetails(id: number, updatedDetails: string): Observable<any> {
    const url = `${this.baseUrl}/${id}/details`;
    const params = new HttpParams().set('details', updatedDetails); // Send updatedDetails as a request parameter
    return this.http.put(url, {}, { params }); // Send an empty request body since details are sent as a parameter
}

  updateLicenseeName(id: any, license: any): Observable<any> {
    const modifiedValue = license.licensee === 'Unknown' ? id : null; 
    const body = { ...license, modified: modifiedValue };
  
    return this.http.put<any>(`http://localhost:8080/payments/${id}`, body);
  }


  getPayments(): Observable<any[]> {
    // You can make a request to your Payments backend to establish a connection
    return this.http.get<any[]>(`${this.baseUrl}/payments`).pipe(
      catchError(this.handleError)
    );
  }


  createPayment(payment: any): Observable<any> {
    // Make an HTTP POST request to create a payment on your server
    return this.http.post<any>(`${this.baseUrl}/payments`, payment);
  }
  updatePayment(id: number, payment: any): Observable<any> {
    return this.http.put<any>(`http://localhost:8080/payments/${id}`, payment);
  }


  updatePaymentLicensee(id: any, payment: any): Observable<any> {
    const modifiedValue = payment.licensee === 'Unknown' ? id : null; 
    const body = { ...payment, modified: modifiedValue };
  
    return this.http.put<any>(`${this.baseUrl}/payments/${id}`, body);
  }


  deletePayment(id: number): Observable<void> {
    // Make an HTTP DELETE request to delete a payment on your server
    return this.http.delete<void>(`${this.baseUrl}/payments/${id}`);
  }


  undoUpdatePayment(id: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/payments/${id}/undo`, {});
  }
  
  getMultiplePayments(): Observable<any[]> {
    // Assuming you have an API endpoint to fetch multiple payments data
    return this.http.get<any[]>(`${this.baseUrl}/multiple-payments`);
  }

  
  createMultiplePayment(payment: any): Observable<any> {
    // Make an HTTP POST request to create a payment on your server
    return this.http.post<any>(`${this.baseUrl}/multiple-payments`, payment);
  }

  updateMultiplePaymentLicensee(id: any, payment: any): Observable<any> {
    let modifiedValue = null;
    const licenseeRegex = /^([^|]+)(?:\s*\|\s*([^|]+))*$/;

    if (licenseeRegex.test(payment.licensee)) {
        // If licensee contains multiple values separated by '|'
        modifiedValue = payment.licensee;
    } else {
        // If licensee doesn't match the regex pattern
        modifiedValue = id;
    }

    const body = { ...payment, modified: modifiedValue };

    return this.http.put<any>(`${this.baseUrl}/multiple-payments/${id}`, body);
}

  deleteMultiplePayment(id: number): Observable<void> {
    // Make an HTTP DELETE request to delete a payment on your server
    return this.http.delete<void>(`${this.baseUrl}/multiple-payments/${id}`);
  }

  updateLicenseeNameMP(id: any, license: any): Observable<any> {
    const modifiedValue = license.licensee === 'Unknown' ? id : null; 
    const body = { ...license, modified: modifiedValue };
  
    return this.http.put<any>(`http://localhost:8080/update-Mp-LicenseeName/${id}`, body);
  }


  
  undoUpdateMultiplePayment(id: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/multiple-payments/${id}/undo`, {});
  }
  
}
