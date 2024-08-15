import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PdfLibraryService } from '../pdf-library-service.service';
import { ExamplePdfViewerComponent } from '../example-pdf-viewer/example-pdf-viewer.component';
import { environment } from 'env/environment';

interface PdfFile {
  path: string;
  name: string;
  title?: string;
  date?: string;
  details?: string;
  directory_path?: string;
  showDetails?: boolean;
  highlightedDetails?: string[]; // Change this to string[]
}
@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit {
  @ViewChild(ExamplePdfViewerComponent, { static: false }) pdfViewer!: ExamplePdfViewerComponent;
  @Input() pdfSrc: string = '';
  private url = environment.frontUrl;

  pdfFiles: PdfFile[] = [];
  filteredPdfFiles: PdfFile[] = [];
  searchQuery: string = '';
  selectedReportType: string = '';
  selectedDate: string = '';
  searchByTitle: boolean = false;
  searchByDetails: boolean = false;

  showPopup: boolean = false;
  showPDFViewer: boolean = false;

  uniqueDates: string[] = [];

  constructor(private pdfLibraryService: PdfLibraryService) {}

  ngOnInit(): void {
    this.loadPdfFiles();
  }

  loadPdfFiles(): void {
    this.pdfLibraryService.getPdfFilesFromAllTables().subscribe({
      next: (files: PdfFile[]) => {
        this.pdfFiles = files.map((file: PdfFile) => {
          let title = 'Unknown Title';
          let date = 'Unknown Year';

          if (file.directory_path) {
            const normalizedPath = file.directory_path.replace(/\\/g, '/');
            const lastSlashIndex = normalizedPath.lastIndexOf('/');
            if (lastSlashIndex !== -1) {
              title = normalizedPath.substring(lastSlashIndex + 1).replace('.pdf', '') || 'Unknown Title';
            }
            const dateMatch = normalizedPath.match(/\b\d{4}\b/);
            if (dateMatch) {
              date = dateMatch[0];
            }
            return {
              ...file,
              directory_path: normalizedPath,
              title: title,
              date: date,
              showDetails: false
            };
          } else {
            return file;
          }
        });

        this.uniqueDates = Array.from(new Set(
          this.pdfFiles.map(file => file.date).filter((date): date is string => date !== 'Unknown Year')
        ));
        this.uniqueDates.sort((a, b) => parseInt(b, 10) - parseInt(a, 10));

        const uniqueFilesMap = new Map<string, PdfFile[]>();
        this.pdfFiles.forEach((file: PdfFile) => {
          const key = `${file.title}_${file.date}`;
          if (uniqueFilesMap.has(key)) {
            uniqueFilesMap.get(key)?.push(file);
          } else {
            uniqueFilesMap.set(key, [file]);
          }
        });

        this.pdfFiles = Array.from(uniqueFilesMap.values()).map(groupedFiles => {
          const baseFile = groupedFiles[0];
          const combinedDetails = groupedFiles
            .map(f => f.details)
            .filter(Boolean)
            .join('\n---\n');
          return {
            ...baseFile,
            details: combinedDetails || baseFile.details,
            showDetails: false
          };
        });

        this.pdfFiles.sort((a, b) => {
          if (a.date === 'Unknown Year' && b.date !== 'Unknown Year') return 1;
          if (b.date === 'Unknown Year' && a.date !== 'Unknown Year') return -1;
          const yearA = parseInt(a.date ?? '0', 10);
          const yearB = parseInt(b.date ?? '0', 10);
          return yearB - yearA;
        });

        this.filteredPdfFiles = this.pdfFiles;
      },
      error: (err: any) => {
        console.error('Error loading PDF files', err);
      }
    });
  }

  searchFiles(): void {
    const query = this.searchQuery.toLowerCase().trim();
    const { terms, operators } = this.parseQuery(query);

    const filteredTerms = terms.map(term => term.trim());
    const isAndOperation = operators.includes('AND') && !operators.includes('OR');

    this.filteredPdfFiles = this.pdfFiles.filter(file => {
      // Filter by report type
      if (this.selectedReportType && (!file.title || !file.title.includes(this.selectedReportType))) {
        return false;
      }

      // Filter by date
      if (this.selectedDate && file.date !== this.selectedDate) {
        return false;
      }

      // If no search terms and not filtering by title or details, keep the file
      if (filteredTerms.length === 0 && !this.searchByTitle && !this.searchByDetails) {
        return true;
      }

      let matchesTitle = false;
      let matchesDetails = false;

      // Only process title search if "Search by Title" is checked
      if (this.searchByTitle && file.title) {
        const titleLower = file.title!.toLowerCase();
        matchesTitle = isAndOperation
          ? filteredTerms.every(term => this.isTermMatch(titleLower, term))
          : filteredTerms.some(term => this.isTermMatch(titleLower, term));
      }

      // Only process details search if "Search by Details" is checked
      if (this.searchByDetails && file.details) {
        const detailRows = file.details.split('\n---\n');
        const matchingRows = detailRows.filter(row => {
          const rowLower = row.toLowerCase();
          return isAndOperation
            ? filteredTerms.every(term => this.isTermMatch(rowLower, term))
            : filteredTerms.some(term => this.isTermMatch(rowLower, term));
        });

        matchesDetails = matchingRows.length > 0;

        if (matchesDetails) {
          file.highlightedDetails = matchingRows.map(row =>
            this.highlightMatchingDetails(row, filteredTerms)
          );
          file.showDetails = true;
        } else {
          file.highlightedDetails = [];
          file.showDetails = false;
        }
      }

      // Return true only if the conditions for title or details search are satisfied
      return (this.searchByTitle && matchesTitle) || (this.searchByDetails && matchesDetails);
    });
  }

  isTermMatch(text: string, term: string): boolean {
    // Use regex to ensure term is matched as a whole word and not preceded by a hyphen or letters
    const regex = new RegExp(`(^|[^\\w-])${term}([^\\w-]|$)`, 'i');
    return regex.test(text);
  }





  matchWholeWord(text: string, terms: string[], isAndOperation: boolean): boolean {
    const termPatterns = terms.map(term => `\\b${this.escapeRegExp(term)}\\b`);
    const regexPattern = isAndOperation
      ? termPatterns.join(')(?=.*?')
      : termPatterns.join('|');

    const regex = new RegExp(regexPattern, 'i');

    return isAndOperation
      ? terms.every(term => new RegExp(`\\b${this.escapeRegExp(term)}\\b`, 'i').test(text))
      : regex.test(text);
  }


  escapeRegExp(term: string): string {
    return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }




  highlightMatchingDetails(details: string, terms: string[]): string {
    let highlightedDetails = details;

    terms.forEach(term => {
      // Use regex with boundaries to highlight the exact term
      const regex = new RegExp(`(^|[^\\w-])${term}([^\\w-]|$)`, 'gi');
      highlightedDetails = highlightedDetails.replace(regex, (match, p1, p2) => `${p1}<mark>${match.trim()}</mark>${p2}`);
    });

    return highlightedDetails;
  }






  parseQuery(query: string): { terms: string[], operators: string[] } {
    const terms: string[] = [];
    const operators: string[] = [];

    const regex = /\s*(AND|OR)\s*/i;
    const splitQuery = query.split(regex);

    splitQuery.forEach((part, index) => {
      if (index % 2 === 0) {
        if (part.trim().length > 0) {
          terms.push(part.trim());
        }
      } else {
        operators.push(part.trim().toUpperCase());
      }
    });

    return { terms, operators };
  }




  openPDFViewer(file: PdfFile, event: Event): void {
    event.stopPropagation();
    if (!file.directory_path) {
      console.error('File path is undefined for file:', file);
      return;
    }

    const filePath = file.directory_path;

    this.pdfLibraryService.checkFileExistsInAssets(filePath).subscribe(existsInAssets => {
      if (existsInAssets) {
        const url = `${this.url}/assets/${filePath}`;
        console.log('Constructed PDF URL:', url);

        const windowFeatures = 'width=800,height=600,resizable=yes,scrollbars=yes,status=yes';
        window.open(url, '_blank', windowFeatures);
      } else {
        alert('The selected file is not available in local storage.');
      }
    }, error => {
      console.error('Error checking file existence:', error);
      alert('There was an error checking the file availability.');
    });
  }

  closePopup(): void {
    this.showPopup = false;
    this.showPDFViewer = false;
  }

  showPDFViewerPopup(): void {
    this.showPDFViewer = true;
    this.showPopup = true;
  }

  toggleDetails(file: PdfFile, event: Event): void {
    event.stopPropagation();
    file.showDetails = !file.showDetails;
  }
}
