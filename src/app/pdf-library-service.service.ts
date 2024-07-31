import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface PdfFile {
  path: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class PdfLibraryService {
  private pdfListUrl = 'assets/pdf-files.json';

  constructor(private http: HttpClient) {}

  getPdfFiles(): Observable<PdfFile[]> {
    return this.http.get<PdfFile[]>(this.pdfListUrl);
  }
}
