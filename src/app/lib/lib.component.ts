import { Component, OnInit } from '@angular/core';
import { PdfFile, PdfLibraryService } from '../pdf-library-service.service';

@Component({
  selector: 'app-library',
  templateUrl: './lib.component.html',
  styleUrls: ['./lib.component.css'],
})
export class LIBComponent implements OnInit {
  pdfFiles: PdfFile[] = [];
  filteredPdfFiles: PdfFile[] = [];
  isLoading: boolean = true;

  // Filters and Search
  searchQuery: string = '';
  searchByTitle: boolean = false;
  searchByDetails: boolean = false;
  selectedReportType: string = '';
  selectedYear: string = '';
  uniqueYears: string[] = [];
  uniqueReportTypes: string[] = ['Annual Report', 'Quarterly Report', 'Press Release', 'Judicial Documents', 'Licensing Programs'];

  constructor(private pdfLibraryService: PdfLibraryService) {}

  ngOnInit(): void {
    this.loadExistingFiles();
  }

  loadExistingFiles(): void {
    this.isLoading = true;
    this.pdfLibraryService.getExistingFiles().subscribe({
      next: (files: PdfFile[]) => {
        this.pdfFiles = files;

        // Populate uniqueYears
        this.uniqueYears = Array.from(new Set(this.pdfFiles.map((file) => file.year))).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));

        // Initially set filtered files to all files
        this.filteredPdfFiles = [...this.pdfFiles];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading existing files:', err);
        this.isLoading = false;
      },
    });
  }

  searchFiles(): void {
    const query = this.searchQuery.toLowerCase().trim();

    this.filteredPdfFiles = this.pdfFiles.filter((file) => {
      // Filter by report type


      // Filter by year
      if (this.selectedYear && file.year !== this.selectedYear) {
        return false;
      }

      // Search by title
      if (file.title && file.title.toLowerCase().includes(query)) {
        return true;
      }

      return false;
    });
  }


  startDropboxFileCheck(): void {
    this.pdfLibraryService.checkDropboxFiles().subscribe({
      next: (updatedFiles: PdfFile[]) => {
        this.pdfFiles = updatedFiles;
        this.filteredPdfFiles = [...this.pdfFiles];
        console.log('Dropbox files checked and updated.');
      },
      error: (err) => console.error('Error checking Dropbox files:', err),
    });
  }

  redirectToLink(link: string): void {
    window.open(link, '_blank');
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.searchByTitle = false;
    this.searchByDetails = false;
    this.selectedReportType = '';
    this.selectedYear = '';
    this.filteredPdfFiles = [...this.pdfFiles];
  }
}