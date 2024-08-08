import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PdfLibraryService } from '../pdf-library-service.service';
import { ExamplePdfViewerComponent } from '../example-pdf-viewer/example-pdf-viewer.component';
import { HttpClient } from '@angular/common/http';

interface PdfFile {
  path: string;
  name: string;
  title?: string;
  date?: string;
  details?: string;
  directory_path?: string;
  exists?: boolean;
  showDetails?: boolean; // Manage visibility of details
}

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit {
  @ViewChild(ExamplePdfViewerComponent, { static: false }) pdfViewer!: ExamplePdfViewerComponent;
  @Input() pdfSrc: string = '';

  pdfFiles: PdfFile[] = [];
  filteredPdfFiles: PdfFile[] = [];
  searchQuery: string = '';
  selectedReportType: string = '';
  searchByTitle: boolean = false;
  searchByDate: boolean = false;
  searchByDetails: boolean = false;

  constructor(private pdfLibraryService: PdfLibraryService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPdfFiles();
  }

  async checkFileExists(filePath: string): Promise<boolean> {
    try {
      await this.http.head(filePath, { observe: 'response' }).toPromise();
      return true;
    } catch {
      return false;
    }
  }

  loadPdfFiles(): void {
    this.pdfLibraryService.getPdfFiles().subscribe({
      next: async (response: any) => {
        if (!Array.isArray(response)) {
          console.error('API response is not an array:', response);
          return;
        }

        const files = response as PdfFile[];

        this.pdfFiles = await Promise.all(files.map(async (file: PdfFile) => {
          if (!file.directory_path) {
            console.error('File directory_path is missing for file:', file);
            return {
              ...file,
              title: 'Unknown Title',
              date: 'Unknown Year',
              exists: false,
              showDetails: false
            };
          }

          const filePath = file.directory_path; // Use the full path
          const url = `/assets/${encodeURIComponent(filePath)}`;
          const exists = await this.checkFileExists(url);

          return {
            ...file,
            title: filePath.split('/').pop()?.replace('.pdf', '') || 'Unknown Title',
            date: filePath.match(/\b\d{4}\b/)?.[0] || 'Unknown Year',
            exists,
            showDetails: false
          };
        }));

        this.filteredPdfFiles = this.pdfFiles;
      },
      error: (err: any) => {
        console.error('Error loading PDF files', err);
      }
    });
  }

  searchFiles(): void {
    const query = this.searchQuery.toLowerCase();

    this.filteredPdfFiles = this.pdfFiles.filter((file: PdfFile) => {
      const titleMatch = this.searchByTitle && file.title ? file.title.toLowerCase().includes(query) : true;
      const dateMatch = this.searchByDate && file.date ? file.date.toLowerCase().includes(query) : true;
      const detailsMatch = this.searchByDetails && file.details ? file.details.toLowerCase().includes(query) : true;

      const matchesQuery = (this.searchByTitle && titleMatch) ||
                           (this.searchByDate && dateMatch) ||
                           (this.searchByDetails && detailsMatch) ||
                           (!this.searchByTitle && !this.searchByDate && !this.searchByDetails);

      const reportTypeMatch = this.selectedReportType ? file.directory_path?.includes(this.selectedReportType) : true;

      return matchesQuery && reportTypeMatch;
    });
  }

  openPDFViewer(file: PdfFile, event: Event): void {
    event.stopPropagation(); // Prevent toggling details when clicking view button
    if (!file.directory_path) {
      console.error('File path is undefined for file:', file);
      return;
    }

    const url = `http://localhost:4200/assets/${encodeURIComponent(file.directory_path)}`;
    console.log('Constructed PDF URL:', url); // Log the constructed URL for debugging

    // Open the PDF file in a new sub-browser window
    const windowFeatures = 'width=800,height=600,resizable=yes,scrollbars=yes,status=yes';
    window.open(url, '_blank', windowFeatures);
  }

showPopup: boolean = false;
showPDFViewer: boolean = false;

closePopup(): void {
  this.showPopup = false;
  this.showPDFViewer = false;
}

showPDFViewerPopup(): void {
  this.showPDFViewer = true;
  this.showPopup = true;
}
toggleDetails(file: PdfFile, event: Event): void {
  event.stopPropagation(); // Prevent clicking the card
  file.showDetails = !file.showDetails;
}
}
