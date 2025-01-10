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
  selectedYear: string = '';
  uniqueYears: string[] = [];
  uniqueReportTypes: string[] = [
    'Annual Report',
    'Quarterly Report',
    'Press Release',
    'Judicial Documents',
    'Licensing Programs',
  ];

  constructor(private pdfLibraryService: PdfLibraryService) {}

  ngOnInit(): void {
    this.loadAndSyncFiles();
  }

  loadAndSyncFiles(): void {
    this.isLoading = true;

    // First, fetch existing files
    this.pdfLibraryService.getExistingFiles().subscribe({
      next: (files: PdfFile[]) => {
        this.pdfFiles = files;
        this.filteredPdfFiles = [...this.pdfFiles];
        this.populateUniqueYears();

        // Then, sync with Dropbox
        this.pdfLibraryService.checkDropboxFiles().subscribe({
          next: (syncedFiles: PdfFile[]) => {
            this.pdfFiles = syncedFiles;
            this.filteredPdfFiles = [...this.pdfFiles];
            this.populateUniqueYears();
            this.isLoading = false;
            console.log('Synchronization complete:', syncedFiles);
          },
          error: (err) => {
            console.error('Error during synchronization:', err);
            this.isLoading = false;
          },
        });
      },
      error: (err) => {
        console.error('Error fetching existing files:', err);
        this.isLoading = false;
      },
    });
  }

  searchFiles(): void {
    const query = this.searchQuery.toLowerCase().trim();

    this.filteredPdfFiles = this.pdfFiles.filter((file) => {
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
    // Open a new window with minimal UI (no menubar, toolbar, location bar, etc.)
    const windowFeatures =
      'menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes,width=800,height=600';
    window.open(link, '_blank', windowFeatures);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedYear = '';
    this.filteredPdfFiles = [...this.pdfFiles];
  }

  populateUniqueYears(): void {
    if (this.pdfFiles.length === 0) {
      this.uniqueYears = [];
      return;
    }

    // Convert 'year' to numbers and filter out NaN values
    const allYears = this.pdfFiles
      .map(file => Number(file.year))
      .filter(value => !Number.isNaN(value)); // Corrected filter usage

    if (allYears.length === 0) {
      this.uniqueYears = [];
      return;
    }

    const minYear = Math.min(...allYears);
    const maxYear = Math.max(...allYears);

    // Build an array of all years from max down to min
    this.uniqueYears = [];
    for (let year = maxYear; year >= minYear; year--) {
      this.uniqueYears.push(year.toString());
    }
  }
}
