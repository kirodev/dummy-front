import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { TokenStorageService } from './_services/token-storage.service';
import { environment } from 'env/environment';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private   url = environment.baseUrl;
  private baseUrl = this.url +'licenses';
  private baseUrlML =  this.url +'multiple-licenses';

  private tableData: string[][] = [];
  private cellColors: { row: number; col: number; color: string }[] = [];

  constructor(private http: HttpClient, private tokenStorageService: TokenStorageService) {}

  // Modify this method to include the JWT token in the HTTP request headers
  private getHeaders(): HttpHeaders {
    const token = this.tokenStorageService.getToken(); // Get the JWT token from your token storage service
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Include the JWT token in the Authorization header
    });
  }

  // Modify your existing methods to include the JWT token in the HTTP request headers
  getData(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
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




  getLicenseById(id: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

 createLicense(license: any): Observable<any> {
    const headers = this.getHeaders(); // Get the headers including the JWT token
    return this.http.post<any>(`${this.baseUrl}`, license, { headers }).pipe(
      catchError(this.handleError)
    );
}

updateLicense(id: any, license: any, comment: string): Observable<any> {
    const headers = this.getHeaders(); // Get the headers including the JWT token
    license.comment = comment;
    return this.http.put<any>(`${this.baseUrl}/${id}`, license, { headers });
}



undoUpdateLicensee(id: any, comment: string): Observable<any[]> {
  const headers = this.getHeaders(); // Get the headers including the JWT token
  return this.http.put<any>(`${this.baseUrl}/${id}/undo`, comment, { headers }); // Include the headers in the request
}


deleteLicense(id: any): Observable<any> {
    const headers = this.getHeaders(); // Get the headers including the JWT token
    return this.http.delete<any>(`${this.baseUrl}/${id}`, { headers });
}

deleteMultipleLicenses(id: any): Observable<any> {
  const headers = this.getHeaders(); // Get the headers including the JWT token
  return this.http.delete<any>(`${this.baseUrlML}/${id}`, { headers });
}

updateLicenseeName(id: any, license: any): Observable<any> {
    const headers = this.getHeaders(); // Get the headers including the JWT token
    const modifiedValue = license.licensee === 'Unknown' ? id : null;
    const body = { ...license, modified: modifiedValue };
    return this.http.put<any>(`${this.url}/${id}`, body, { headers });
}

updateDetails(id: number, updatedDetails: string): Observable<any> {
  const headers = this.getHeaders(); // Get the headers including the JWT token
  const url = `${this.baseUrl}/${id}/details`;
  const params = new HttpParams().set('details', updatedDetails); // Send updatedDetails as a request parameter
  return this.http.put(url, {}, { params, headers }); // Send an empty request body since details are sent as a parameter
}

updateMLDetails(id: number, updatedDetails: string): Observable<any> {
  const headers = this.getHeaders(); // Get the headers including the JWT token
  const url = `${this.baseUrlML}/${id}/details`;
  const params = new HttpParams().set('details', updatedDetails); // Send updatedDetails as a request parameter
  return this.http.put(url, {}, { params, headers }); // Send an empty request body since details are sent as a parameter
}
  getLicenseAmountData(): Observable<number[]> {
    return this.http.get<any[]>(`${this.baseUrl}/data`).pipe(map((response: any[]) => {

        return response.map(entry => entry.payment_amount);
      }),
      catchError(this.handleError)
    );
  }


  getMultipleLicenses(): Observable<any[]> {
    const headers = this.getHeaders(); // Get the headers including the JWT token
        return this.http.get<any[]>(`${this.baseUrlML}`,{ headers }).pipe(
          catchError(this.handleError)
        );
  }


  updateKnownLicensees(id: any, knownLicensee: string): Observable<any> {
    // Assuming you have an API endpoint to update known licensees data
    return this.http.put<any>(`${this.baseUrl}/${id}`, { knownLicensee });
  }



    // Define a method to fetch distinct licensee names from the server
    getDistinctLicensees(): Observable<string[]> {
      return this.http.get<string[]>(''); // Replace '/api/distinct/licensees' with your actual API endpoint
    }


  getDataByLicensor(licensorName: string): Observable<any[]> {
    const params = new HttpParams().set('licensor', licensorName);
    return this.http.get<any[]>(`${this.baseUrl}`, { params }).pipe(
      catchError(this.handleError)
    );
  }


  createMultipleLicensee(newLicense: any): Observable<any> {
    const headers = this.getHeaders(); // Get the headers including the JWT token
    const url = `${this.baseUrlML}`; // Adjust the endpoint as necessary
    return this.http.post(url, newLicense, { headers }).pipe(
      catchError(this.handleError)
    );

  }
  updateMultipleLicensee(id: any, license: any, comment?: string): Observable<any> {
    let modifiedValue = null;
    const licenseeRegex = /^([^|]+)(?:\s*\|\s*([^|]+))*$/;

    if (licenseeRegex.test(license.licensee)) {
        // If licensee contains multiple values separated by '|'
        modifiedValue = license.licensee;
    } else {
        // If licensee doesn't match the regex pattern
        modifiedValue = id;
    }

    // Include the comment in the request body
    const body = { ...license, modified: modifiedValue, comment: comment };

    const headers = this.getHeaders(); // Get the headers including the JWT token
    return this.http.put<any>(`${this.baseUrlML}/${id}`, body, { headers }); // Include the headers in the request
}

deleteMultiplePayment(id: number): Observable<void> {
    const headers = this.getHeaders(); // Get the headers including the JWT token
    return this.http.delete<void>(`${this.baseUrlML}/${id}`, { headers }); // Include the headers in the request
}

undoUpdateMultipleLicensee(id: any): Observable<any[]> {
    const headers = this.getHeaders(); // Get the headers including the JWT token
    return this.http.put<any>(`${this.baseUrlML}/${id}/undo`, { headers }); // Include the headers in the request
}



getLicensesMappingIds(): Observable<string[]> {
  const url = `${this.baseUrlML}/mappingId`;
  const headers = this.getHeaders(); // Get the headers including the JWT token
  return this.http.get<string[]>(url, { headers }); // Include the headers in the request
}



deleteMappingId(id: number): Observable<void> {
  const headers = this.getHeaders(); // Get the headers including the JWT token

  return this.http.delete<void>(`${this.baseUrl}/${id}/mapping_id`, { headers });
}


deleteMPMappingId(id: number): Observable<void> {
  const headers = this.getHeaders(); // Get the headers including the JWT token

  return this.http.delete<void>(`${this.baseUrlML}/${id}/mapping_id`, { headers });
}


updateLicenseMappingId(itemId: number, mappingId: string): Observable<any> {
    const url = `${this.baseUrl}/${itemId}/mappingId`;
    const headers = this.getHeaders(); // Get the headers including the JWT token
    return this.http.put(url, mappingId, { headers }); // Include the headers in the request
  }

  updateMLMappingId(itemId: number, mappingId: string): Observable<any> {
    const url = `${this.baseUrlML}/${itemId}/MLmappingId`;
    const headers = this.getHeaders(); // Get the headers including the JWT token
    return this.http.put(url, mappingId, { headers }).pipe(
      catchError(this.handleError)
    ); // Include the headers in the request
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
