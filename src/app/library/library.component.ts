import { Component, Input, OnInit, ViewChild ,SecurityContext} from '@angular/core';
import { PdfLibraryService } from '../pdf-library-service.service';
import { ExamplePdfViewerComponent } from '../example-pdf-viewer/example-pdf-viewer.component';
import { environment } from 'env/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
// Import the Cloudinary classes.
import { Cloudinary } from '@cloudinary/url-gen';

interface PdfFile {
  path: string;
  name: string;
  title?: string;
  date?: string;
  details?: string;
  directory_path?: string;
  showDetails?: boolean;
  highlightedDetails?: string[];
  cloudinaryPublicId?: string; // Cloudinary Public ID for PDF
  cloudinaryUrl?: string; // Constructed Cloudinary URL
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

  constructor(private pdfLibraryService: PdfLibraryService,private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.loadPdfFiles();
  }
  sanitizeContent(content: string): SafeHtml {
    return this.sanitizer.sanitize(SecurityContext.HTML, content) || '';
  }

  loadPdfFiles(): void {

  }



  searchFiles(): void {
    const query = this.searchQuery.toLowerCase().trim();
    const { terms, operators } = this.parseQuery(query);

    const filteredTerms = terms.map(term => term.trim());
    const isAndOperation = operators.includes('AND') && !operators.includes('OR');

    this.filteredPdfFiles = this.pdfFiles.filter(file => {
      if (this.selectedReportType && (!file.directory_path || !file.directory_path.includes(this.selectedReportType))) {
        return false;
      }

      if (this.selectedDate && file.date !== this.selectedDate) {
        return false;
      }

      if (filteredTerms.length === 0 && !this.searchByTitle && !this.searchByDetails) {
        file.highlightedDetails = [file.details || ''];
        file.showDetails = false;
        return true;
      }

      let matchesTitle = false;
      let matchesDetails = false;

      if (this.searchByTitle && file.title) {
        file.showDetails = false;
        const titleLower = file.title!.toLowerCase();
        matchesTitle = isAndOperation
          ? filteredTerms.every(term => this.isTermMatch(titleLower, term))
          : filteredTerms.some(term => this.isTermMatch(titleLower, term));
      }

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

      return (this.searchByTitle && matchesTitle) || (this.searchByDetails && matchesDetails);
    });
  }

  isTermMatch(text: string, term: string): boolean {
    const regex = new RegExp(`(^|[^\\w-])${term}([^\\w-]|$)`, 'i');
    return regex.test(text);
  }

  highlightMatchingDetails(details: string, terms: string[]): string {
    const escapedTerms = terms.map(term => this.escapeRegExp(term));
    const regexPattern = `(${escapedTerms.join('|')})`;
    const regex = new RegExp(regexPattern, 'gi');
    return details.replace(regex, match => `<mark>${match}</mark>`);
  }

  escapeRegExp(term: string): string {
    return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

    if (!file.cloudinaryUrl) {
      console.error('Cloudinary URL is undefined for file:', file);
      return;
    }

    const cloudinaryPdfUrl = file.cloudinaryUrl;
    console.log('Opening PDF from Cloudinary:', cloudinaryPdfUrl);

    const windowFeatures = 'width=800,height=600,resizable=yes,scrollbars=yes,status=yes';
    window.open(cloudinaryPdfUrl, '_blank', windowFeatures);
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

    if (file.showDetails) {
      if (!this.searchByDetails || !file.highlightedDetails || file.highlightedDetails.length === 0) {
        const detailRows = (file.details || '').split('\n---\n');
        file.highlightedDetails = detailRows.map(row =>
          this.highlightMatchingDetails(row, this.searchQuery.toLowerCase().split(/\s+/))
        );
      }
    } else {
      file.highlightedDetails = [];
    }
  }
}
