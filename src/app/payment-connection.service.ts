import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { TokenStorageService } from './_services/token-storage.service';
import { environment } from 'env/environment';
@Injectable({
  providedIn: 'root'
})
export class PaymentConnection {

  constructor(private http: HttpClient, private tokenStorageService: TokenStorageService) {}

  private   url = environment.baseUrl;
  private baseUrl = this.url +'payments';
  private baseUrlMP =  this.url +'multiple-payments';
  private baseUrlqRev = this.url +'quarterly-revenues';
  private baseUrlaRev = this.url +'annual-revenues';


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

  getPayments(): Observable<any[]> {
    const headers = this.getHeaders(); // Get the headers including the JWT token
    return this.http.get<any[]>(`${this.baseUrl}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  updateDetails(id: number, updatedDetails: string): Observable<any> {
    const headers = this.getHeaders(); // Get the headers including the JWT token
    const url = `${this.baseUrl}/${id}/details`;
    const params = new HttpParams().set('details', updatedDetails); // Send updatedDetails as a request parameter
    return this.http.put(url, {}, { params, headers }); // Send an empty request body since details are sent as a parameter
  }

  updateMPDetails(id: number, updatedDetails: string): Observable<any> {
    const headers = this.getHeaders(); // Get the headers including the JWT token
    const url = `${this.baseUrlMP}/${id}/details`;
    const params = new HttpParams().set('details', updatedDetails); // Send updatedDetails as a request parameter
    return this.http.put(url, {}, { params, headers }); // Send an empty request body since details are sent as a parameter
  }

  updateLicenseeName(id: any, license: any): Observable<any> {
    const modifiedValue = license.licensee === 'Unknown' ? id : null;
    const body = { ...license, modified: modifiedValue };
    const headers = this.getHeaders(); // Get the headers including the JWT token

    return this.http.put<any>(`${this.baseUrl}/${id}`, body,{ headers });
  }





  createPayment(payment: any,): Observable<any> {
    const headers = this.getHeaders(); // Get the headers including the JWT token
    return this.http.post<any>(`${this.baseUrl}`, payment,{ headers });
  }
  updatePayment(id: number, payment: any, comment: string): Observable<any> {
    // Include the comment in the payment object
    payment.comment = comment;
    const headers = this.getHeaders(); // Get the headers including the JWT token

    // Make the PUT request with the modified payment object
    return this.http.put<any>(`${this.baseUrl}/${id}`, payment,{ headers });
}



  updatePaymentLicensee(id: any, payment: any): Observable<any> {
    const modifiedValue = payment.licensee === 'Unknown' ? id : null;
    const body = { ...payment, modified: modifiedValue };
    const headers = this.getHeaders(); // Get the headers including the JWT token

    return this.http.put<any>(`${this.baseUrl}/${id}`, body, {headers});
  }


  deletePayment(id: number): Observable<void> {
    // Make an HTTP DELETE request to delete a payment on your server
    const headers = this.getHeaders(); // Get the headers including the JWT token

    return this.http.delete<void>(`${this.baseUrl}/${id}`, {headers});
  }


  deleteMappingId(id: number): Observable<void> {
    const headers = this.getHeaders(); // Get the headers including the JWT token

    return this.http.delete<void>(`${this.baseUrl}/${id}/mapping_id`, { headers });
  }


  deleteMPMappingId(id: number): Observable<void> {
    const headers = this.getHeaders(); // Get the headers including the JWT token

    return this.http.delete<void>(`${this.baseUrlMP}/${id}/mapping_id`, { headers });
  }

  undoUpdatePayment(id: any, comment: string): Observable<any[]> {
  const headers = this.getHeaders(); // Get the headers including the JWT token
  return this.http.put<any>(`${this.baseUrl}/${id}/undoP`,  { comment }, { headers }); // Include the headers in the request
}


  getMultiplePayments(): Observable<any[]> {
    const headers = this.getHeaders(); // Get the headers including the JWT token
        return this.http.get<any[]>(`${this.baseUrlMP}`,{ headers }).pipe(
          catchError(this.handleError)
        );
  }


createMultiplePayment(newPayment: any): Observable<any> {
  const headers = this.getHeaders(); // Get the headers including the JWT token
  const url = `${this.baseUrlMP}`; // Adjust the endpoint as necessary
  return this.http.post(url, newPayment, { headers }).pipe(
    catchError(this.handleError)
  );

}
updateMultiplePaymentLicensee(id: any, payment: any, comment?: string): Observable<any> {
    let modifiedValue = null;
    const licenseeRegex = /^([^|]+)(?:\s*\|\s*([^|]+))*$/;

    if (licenseeRegex.test(payment.licensee)) {
        // If licensee contains multiple values separated by '|'
        modifiedValue = payment.licensee;
    } else {
        // If licensee doesn't match the regex pattern
        modifiedValue = id;
    }

    // Include the comment in the request body
    const body = { ...payment, modified: modifiedValue, comment: comment };

    const headers = this.getHeaders(); // Get the headers including the JWT token
    return this.http.put<any>(`${this.baseUrlMP}/${id}`, body, { headers }); // Include the headers in the request
}


  deleteMultiplePayment(id: number): Observable<void> {
    // Make an HTTP DELETE request to delete a payment on your server
    const headers = this.getHeaders();

    return this.http.delete<void>(`${this.baseUrlMP}/${id}`, { headers });
  }



  undoUpdateMultiplePayment(id: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put<any>(`${this.baseUrlMP}/${id}/undoP`, { headers });
  }


  updatePaymentMappingId(itemId: number, mappingId: string): Observable<any> {
    const url = `${this.baseUrl}/${itemId}/mappingId`;
    const headers = this.getHeaders(); // Get the headers including the JWT token
    return this.http.put(url, mappingId, { headers }); // Include the headers in the request
  }

  updateMPMappingId(itemId: number, mappingId: string): Observable<any> {
    const url = `${this.baseUrlMP}/${itemId}/MPmappingId`;
    const headers = this.getHeaders(); // Get the headers including the JWT token
    return this.http.put(url, mappingId, { headers }).pipe(
      catchError(this.handleError)
    ); // Include the headers in the request
}
getQuarterlyRevenues(): Observable<any[]> {
  const headers = this.getHeaders(); // Get the headers including the JWT token
  return this.http.get<any[]>(`${this.baseUrlqRev}`, { headers }).pipe(
    catchError(this.handleError)
  );
}


getAnnualRevenues(): Observable<any[]> {
  const headers = this.getHeaders(); // Get the headers including the JWT token
  return this.http.get<any[]>(`${this.baseUrlaRev}`, { headers }).pipe(
    catchError(this.handleError)
  );
}
}
