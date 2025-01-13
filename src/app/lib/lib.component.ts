// src/app/lib/lib.component.ts

import { Component, OnInit } from '@angular/core';
import { PdfFile, PdfLibraryService } from '../pdf-library-service.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-library',
  templateUrl: './lib.component.html',
  styleUrls: ['./lib.component.css'],
})
export class LIBComponent implements OnInit {
  pdfFiles: PdfFile[] = [];
  filteredPdfFiles: PdfFile[] = [];
  isLoading: boolean = true; // Indicates loading of existing files
  isSyncing: boolean = false; // Indicates synchronization with Dropbox
  errorMessage: string = ''; // To display error messages

  // Filters and Search
  searchQuery: string = '';
  selectedYear: string = '';
  selectedReportType: string = ''; // For report type filtering
  uniqueYears: string[] = [];
  uniqueReportTypes: string[] = [
    'Annual Report',
    'Quarterly Report',
    'Current reports',
    'Press Release',
    'Judicial Documents',
    'Licensing Programs',
    'Licensing Terms Statements',
    'Reports',
    'Papers'
  ];

  // For Debounced Search
  searchSubject: Subject<string> = new Subject();

  constructor(private pdfLibraryService: PdfLibraryService) {}

  ngOnInit(): void {
    this.loadExistingFiles();

    // Initialize the debounce for search
    this.searchSubject.pipe(debounceTime(300)).subscribe((searchTextValue) => {
      this.searchQuery = searchTextValue;
      this.searchFiles();
    });
  }

  /**
   * Loads existing PDF files and displays them immediately.
   */
  loadExistingFiles(): void {
    this.isLoading = true;
    this.errorMessage = ''; // Reset error message

    this.pdfLibraryService.getExistingFiles().subscribe({
      next: (files: PdfFile[]) => {
        console.log(`Fetched ${files.length} Existing Files.`);
        const validFiles = files.filter((file) => !!file.path);
        console.log(`Valid Files Count: ${validFiles.length}`);
        const mappedFiles = validFiles.map((file: PdfFile) => this.mapPdfFile(file));
        console.log('Mapped Existing Files:', mappedFiles);
        this.pdfFiles = mappedFiles;
        this.filteredPdfFiles = [...this.pdfFiles];
        this.populateUniqueYears();
        // uniqueReportTypes are predefined; no need to populate dynamically here

        this.isLoading = false;

        // Start synchronizing with Dropbox after loading existing files
        this.syncWithDropbox();
      },
      error: (err) => {
        console.error('Error fetching existing files:', err);
        this.errorMessage =
          'Failed to load existing PDF files. Please try again later.';
        this.isLoading = false;
      },
    });
  }

  /**
   * Synchronizes with Dropbox to fetch new PDF files and appends them to the existing list.
   */
  syncWithDropbox(): void {
    this.isSyncing = true;

    this.pdfLibraryService.checkDropboxFiles().subscribe({
      next: (syncedFiles: PdfFile[]) => {
        console.log('Fetched Synced Files from Dropbox:', syncedFiles);
        const mappedSyncedFiles = syncedFiles.map((file: PdfFile) =>
          this.mapPdfFile(file)
        );
        console.log('Mapped Synced Files:', mappedSyncedFiles);

        // Avoid duplicates by checking if the file already exists
        mappedSyncedFiles.forEach((syncedFile) => {
          const exists = this.pdfFiles.some(
            (existingFile) => existingFile.path === syncedFile.path
          );
          if (!exists) {
            this.pdfFiles.push(syncedFile);
            this.filteredPdfFiles.push(syncedFile);
          }
        });

        this.populateUniqueYears();
        // If uniqueReportTypes are dynamic, update them here

        this.isSyncing = false;
        console.log('Synchronization complete:', mappedSyncedFiles);
      },
      error: (err) => {
        console.error('Error during synchronization:', err);
        this.errorMessage =
          'Failed to synchronize with Dropbox. Please try again later.';
        this.isSyncing = false;
      },
    });
  }

  /**
   * Maps and normalizes a PdfFile object by extracting necessary properties.
   * @param file The original PdfFile object.
   * @returns The mapped and normalized PdfFile object.
   */
  mapPdfFile(file: PdfFile): PdfFile {
    return {
      ...file,
      type: this.extractReportType(file.path),
      year: this.extractYear(file.path), // Consistently using 'year'
      sharedLink: file.sharedLink || this.constructSharedLink(file.path), // Assuming a method to construct sharedLink if not present
    };
  }

  /**
   * Extracts and normalizes the report type from the file path.
   * @param path The file path string
   * @returns The normalized report type or 'Unknown' if not found
   */
  extractReportType(path: string | null | undefined): string {
    if (!path) {
      console.warn('extractReportType called with null or undefined path.');
      return 'Unknown';
    }

    // Split the path using backslash as the delimiter
    const parts = path.split('\\');
    let extractedType = parts.length > 0 ? parts[0].trim() : 'Unknown';

    // Remove prefixes like '10-Q', '10-K', etc.
    extractedType = extractedType.replace(/^\d{1,2}-\w+\s+/, '').trim();

    // Mapping normalized types to match uniqueReportTypes (including singular and plural forms)
    const typeMapping: { [key: string]: string } = {
      'quarterly reports': 'Quarterly Report',
      'quarterly report': 'Quarterly Report',
      'annual reports': 'Annual Report',
      'annual report': 'Annual Report',
      'press releases': 'Press Release',
      'press release': 'Press Release',
      'judicial_documents': 'Judicial Documents',
      'judicial_document': 'Judicial Documents',
      'licensing programs': 'Licensing Programs',
      'licensing program': 'Licensing Programs',
      'licensing terms statements': 'Licensing Terms Statements',
      'licensing terms statement': 'Licensing Terms Statements',
      'reports': 'Reports',
      'report': 'Reports',
      'papers': 'Papers',
      'paper': 'Papers',
      'current reports':'Current reports',
      'current report':'Current reports',

    };

    // Convert to lowercase for case-insensitive mapping
    const lowerCaseType = extractedType.toLowerCase();

    // Find the key in typeMapping that matches the extractedType
    const mappedType = Object.keys(typeMapping).find(
      (key) => key.toLowerCase() === lowerCaseType
    );

    return mappedType ? typeMapping[mappedType] : 'Unknown';
  }

  /**
   * Extracts the year from the path using a regular expression.
   * @param path The file path string
   * @returns The extracted year as a string or 'Unknown' if not found
   */
  extractYear(path: string | null | undefined): string {
    if (!path) {
      console.warn('extractYear called with null or undefined path.');
      return 'Unknown';
    }
    const yearMatch = path.match(/\b(19|20)\d{2}\b/);
    return yearMatch ? yearMatch[0] : 'Unknown';
  }

  /**
   * Constructs the shared link for a PDF file.
   * @param path The file path string
   * @returns The constructed shared link URL or an empty string if path is invalid
   */
  constructSharedLink(path: string | null | undefined): string {
    if (!path) {
      console.warn('constructSharedLink called with null or undefined path.');
      return '';
    }
    // Example: Adjust based on your actual shared link construction logic
    return `https://your-dropbox-link.com/${path}`;
  }

  /**
   * Populates the uniqueYears array based on the years present in pdfFiles.
   */
  populateUniqueYears(): void {
    if (this.pdfFiles.length === 0) {
      this.uniqueYears = [];
      return;
    }

    // Convert 'year' to numbers and filter out NaN values
    const allYears = this.pdfFiles
      .map((file) => Number(file.year))
      .filter((value) => !Number.isNaN(value));

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

  /**
   * Filters the pdfFiles array based on search query, selected year, and selected report type.
   */
  searchFiles(): void {
    const query = this.searchQuery.toLowerCase().trim();

    this.filteredPdfFiles = this.pdfFiles.filter((file) => {
      // Filter by year
      if (this.selectedYear && file.year !== this.selectedYear) {
        return false;
      }

      // Filter by report type
      if (this.selectedReportType && file.type !== this.selectedReportType) {
        return false;
      }

      // Search by title
      if (file.title && file.title.toLowerCase().includes(query)) {
        return true;
      }

      return false;
    });
  }

  /**
   * Redirects the user to the PDF link in a new window with minimal UI.
   * @param link The URL to the PDF file.
   */
  redirectToLink(link: string): void {
    if (!link) {
      console.error('Invalid PDF link:', link);
      return;
    }

    const windowFeatures =
      'menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes,width=800,height=600';
    window.open(link, '_blank', windowFeatures);
  }

  /**
   * Resets all filters to their default states.
   */
  resetFilters(): void {
    this.searchQuery = '';
    this.selectedYear = '';
    this.selectedReportType = '';
    this.filteredPdfFiles = [...this.pdfFiles];
  }

  /**
   * Handles changes in the search input with debouncing.
   * @param event The input event from the search field.
   */
  onSearchInputChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const value = target ? target.value : '';
    this.searchSubject.next(value);
  }
}
