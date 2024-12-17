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
    this.pdfLibraryService.getPdfFilesFromAllTables().subscribe({
      next: (files: PdfFile[]) => {
        const cld = new Cloudinary({
          cloud: { cloudName: 'himbuyrbv' }
        });

        this.pdfFiles = files.map((file: PdfFile) => {
          let title = 'Unknown Title';
          let date = 'Unknown Year';

          if (file.directory_path) {
            const normalizedPath = file.directory_path.replace(/\\/g, '/');

            // Use original file name with specific formatting for Cloudinary URL
            const originalFileName = normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1);

            // Format the file name for Cloudinary by removing brackets and ensuring underscores
            const formattedFileNameForCloudinary = originalFileName
            .replace(/\[(\d{4})\]/, '$1')     // Remove square brackets around the year
            .replace(/\s+/g, '_')             // Replace spaces with underscores
            .replace(/[()]/g, '')            // Replace parentheses with underscores
            .replace('.pdf', '');             // Remove '.pdf' extension

            // Display title: Remove the year and format for readability
            const displayTitle = formattedFileNameForCloudinary
              .replace(/^\d{4}_/, '')         // Remove the year and underscore at the beginning
              .replace(/_/g, ' ')             // Replace underscores with spaces for display
              .trim();

            // Construct Cloudinary URL using the exact format with year and underscores
            const cloudinaryPublicId = `Data Library/${normalizedPath.replace(originalFileName, formattedFileNameForCloudinary)}`;
            const cloudinaryUrl = `https://res.cloudinary.com/hgljhe0wl/image/upload/${cloudinaryPublicId}.pdf`;

            // Extract the date (year) from the path
            const dateMatch = normalizedPath.match(/\b\d{4}\b/);
            if (dateMatch) {
              date = dateMatch[0];
            }

            return {
              ...file,
              directory_path: normalizedPath,
              title: displayTitle,            // Display title without year
              date: date,
              cloudinaryPublicId: cloudinaryPublicId,
              cloudinaryUrl: cloudinaryUrl,    // URL with year and underscores for Cloudinary
              showDetails: false
            };
          } else {
            return file;
          }
        });

        // Unique dates and sorting logic
        this.uniqueDates = Array.from(new Set(
          this.pdfFiles.map(file => file.date).filter((date): date is string => date !== 'Unknown Year')
        ));
        this.uniqueDates.sort((a, b) => parseInt(b, 10) - parseInt(a, 10));

        // Filter unique files
        const uniqueFilesMap = new Map<string, PdfFile[]>();
        this.pdfFiles.forEach((file: PdfFile) => {
          const key = `${file.title}_${file.date}`;
          if (uniqueFilesMap.has(key)) {
            uniqueFilesMap.get(key)?.push(file);
          } else {
            uniqueFilesMap.set(key, [file]);
          }
        });

        // Combine details and sort files by date
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
