import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenStorageService } from './_services/token-storage.service';
import { environment } from 'env/environment';

export interface CompanyType {
  id: number;
  licensee: string;
  type: number;
}

@Injectable({
  providedIn: 'root',
})
export class CompanyTypeService {
  private   url = environment.baseUrl;
  private baseUrl = this.url +'company-types';

  constructor(private http: HttpClient, private tokenStorageService: TokenStorageService) {}

  // Method to get headers with authorization token
  private getHeaders(): HttpHeaders {
    const token = this.tokenStorageService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Add the token in the Authorization header
    });
  }

  // Fetch company types with authentication
  getCompanyTypes(): Observable<CompanyType[]> {
    const headers = this.getHeaders();
    return this.http.get<CompanyType[]>(this.baseUrl, { headers });
  }
}
