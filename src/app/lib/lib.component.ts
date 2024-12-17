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
        this.fetchLibraryFiles();
        this.populateUniqueYears();

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
  fetchLibraryFiles(): void {
    this.isLoading = true;

    // Fetch and update library files from Dropbox
    this.pdfLibraryService.checkDropboxFiles().subscribe({
      next: (files) => {
        this.pdfFiles = files;
        console.log('Fetched and updated library files:', files);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching library files:', err);
        this.isLoading = false;
      }
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

  populateUniqueYears(): void {
    // Extract years from your files
    const allYears = this.pdfFiles.map(file => Number(file.year)); // or simply +file.year
    const minYear = Math.min(...allYears);
    const maxYear = Math.max(...allYears);

    // Build an array of all years from max down to min
    this.uniqueYears = [];
    for (let year = maxYear; year >= minYear; year--) {
      this.uniqueYears.push(year.toString());
    }

}}

