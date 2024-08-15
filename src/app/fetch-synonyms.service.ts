import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FetchSynonymsService {
  private apiUrl = 'https://api.datamuse.com/words'; // Datamuse API endpoint
  private cache: { [word: string]: string[] } = {}; // Simple cache

  constructor(private http: HttpClient) { }

  // Method to fetch synonyms for a given word
  fetchSynonyms(word: string): Observable<string[]> {
    // Check cache first
    if (this.cache[word]) {
      return of(this.cache[word]);
    }

    return this.http.get<any[]>(this.apiUrl, {
      params: {
        rel_syn: word,
        max: '10' // Number of synonyms to fetch
      }
    }).pipe(
      map(response => {
        const synonyms = response.map(item => item.word);
        this.cache[word] = synonyms; // Cache the result
        return synonyms;
      }),
      catchError(this.handleError<string[]>('fetchSynonyms', [])) // Error handling
    );
  }

  // Error handling function
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
