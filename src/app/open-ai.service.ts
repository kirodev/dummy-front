import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpenAIService {
  private apiUrl = 'http://localhost:3000/api/openai'; // Pointing to your Express server

  constructor(private http: HttpClient) {}

  search(query: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { prompt: query });
  }
}
