import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PdfLibraryService } from '../pdf-library-service.service';
import { ExamplePdfViewerComponent } from '../example-pdf-viewer/example-pdf-viewer.component';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

interface PdfFile {
  path: string;
  name: string;
  title?: string;
  date?: string;
  details?: string;
  directory_path?: string;
  exists?: boolean;
  showDetails?: boolean;
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
      const normalizedFilePath = filePath.replace(/\\/g, '/');
      console.log(`Checking file existence for path: ${normalizedFilePath}`);

      const result = await forkJoin({
        existsInTables: this.pdfLibraryService.checkFileExistsInAllTables(normalizedFilePath),
        existsInAssets: this.pdfLibraryService.checkFileExistsInAssets(normalizedFilePath)
      }).toPromise();

      const existsInTables = result?.existsInTables ?? false;
      const existsInAssets = result?.existsInAssets ?? false;
      const exists = existsInTables && existsInAssets;

      if (exists) {
        console.log(`File exists in both tables and assets: ${normalizedFilePath}`);
      } else {
        console.log(`File does not exist in both tables and assets: ${normalizedFilePath}`);
        if (existsInTables) console.log(`File exists in tables but not in assets: ${normalizedFilePath}`);
        if (existsInAssets) console.log(`File exists in assets but not in tables: ${normalizedFilePath}`);
      }

      return exists;
    } catch (error) {
      console.error(`Error checking file existence for path: ${filePath}`, error);
      return false;
    }
  }

  loadPdfFiles(): void {
    this.pdfLibraryService.getPdfFilesFromAllTables().subscribe({
      next: async (files: PdfFile[]) => {
        // Group files by title or another unique identifier
        const groupedFiles: { [key: string]: PdfFile } = {};

        for (const file of files) {
          if (!file.directory_path) {
            console.error('File directory_path is missing for file:', file);
            continue;
          }

          const filePath = file.directory_path;
          const exists = await this.checkFileExists(filePath);
          const title = filePath.split('/').pop()?.replace('.pdf', '') || 'Unknown Title';
          const date = filePath.match(/\b\d{4}\b/)?.[0] || 'Unknown Year';

          // Use title or another property to group duplicates
          if (groupedFiles[title]) {
            // If the title already exists, append details
            groupedFiles[title].details += `, ${file.details}`;
          } else {
            // Create a new entry for the title
            groupedFiles[title] = {
              ...file,
              title,
              date,
              exists,
              showDetails: false
            };
          }
        }
  
        // Convert the grouped files object back to an array
        this.pdfFiles = Object.values(groupedFiles);
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
