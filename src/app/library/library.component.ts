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
  selectedYear: string = '';

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

        this.pdfFiles = Array.from(uniqueFilesMap.values()).map(groupedFiles => {
          const baseFile = groupedFiles[0];

          // Collect all detail lines from each file.
          const allLines: string[] = [];
          for (const file of groupedFiles) {
            if (file.details) {
              const lines = file.details
                .split('\n---\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
              allLines.push(...lines);
            }
          }

          // Remove duplicates using a Set
          const uniqueLines = Array.from(new Set(allLines));

          // Join back into a single string
          const combinedDetails = uniqueLines.join('\n---\n');

          return {
            ...baseFile,
            details: combinedDetails || baseFile.details,
            showDetails: false
          };
        });

        // Optional: If you previously sorted the files by date, retain that logic here.
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

    // Limit terms to a maximum of 5
    const filteredTerms = terms.slice(0, 5).map(term => term.trim());
    const isAndOperation = operators.includes('AND') && !operators.includes('OR');

    this.filteredPdfFiles = this.pdfFiles.filter(file => {
      let matchesTitle = false;
      let matchesDetails = false;

      // Check if the title matches the search terms (but don't highlight titles)
      if (this.searchByTitle && file.title) {
        const titleLower = file.title.toLowerCase();
        matchesTitle = isAndOperation
          ? filteredTerms.every(term => this.isTermMatch(titleLower, term))
          : filteredTerms.some(term => this.isTermMatch(titleLower, term));
      }

      // Check if the details match the search terms
      if (this.searchByDetails && file.details) {
        const detailRows = file.details.split('\n---\n');
        const matchingRows = detailRows.filter(row => {
          const rowLower = row.toLowerCase();
          return isAndOperation
            ? filteredTerms.every(term => this.isTermMatch(rowLower, term))
            : filteredTerms.some(term => this.isTermMatch(rowLower, term));
        });

        matchesDetails = matchingRows.length > 0;

        // Only apply highlighting if there are valid terms
        file.highlightedDetails = matchesDetails && filteredTerms.length > 0
          ? matchingRows.map(row => this.highlightMatchingDetails(row, filteredTerms))
          : [];
      }

      // Always include files, but clear "showDetails" if no search terms match
      file.showDetails = matchesDetails;

      return matchesTitle || matchesDetails || (!this.searchByTitle && !this.searchByDetails && !filteredTerms.length);
    });

    // Ensure "View Highlights" is always present
    this.filteredPdfFiles = this.filteredPdfFiles.map(file => ({
      ...file,
      highlightedDetails: file.highlightedDetails || [],
    }));
  }





  isTermMatch(text: string, term: string): boolean {
    const regex = new RegExp(`(^|[^\\w-])${term}([^\\w-]|$)`, 'i');
    return regex.test(text);
  }

  highlightMatchingDetails(details: string, terms: string[]): string {
    if (!terms || terms.length === 0) {
      return details; // Return details as-is if there are no terms
    }

    // Escape special characters in terms and limit to 5
    const escapedTerms = terms.slice(0, 5).map(term => this.escapeRegExp(term));
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
      // If no search-by-details or highlightedDetails from search, we process lines here
      if (!this.searchByDetails || !file.highlightedDetails || file.highlightedDetails.length === 0) {
        const detailRows = (file.details || '').split('\n---\n').map(line => line.trim()).filter(line => line.length > 0);

        // Remove duplicates again here to be safe
        const uniqueRows = Array.from(new Set(detailRows));

        // Highlight matching details if there's a search query
        const searchTerms = this.searchQuery.toLowerCase().split(/\s+/).filter(t => t.length > 0);
        file.highlightedDetails = uniqueRows.map(row =>
          this.highlightMatchingDetails(row, searchTerms)
        );
      }
    } else {
      file.highlightedDetails = [];
    }
  }
  resetFilters(): void {
    this.searchQuery = '';
    this.selectedYear = '';
    this.selectedReportType = '';
    this.filteredPdfFiles = [...this.pdfFiles];
  }

  sanitizeAndHighlight(text: string, search: string): string {
    if (!search) return text;

    // Escape special characters in the search term
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Match and replace entire words/phrases, not characters
    const regex = new RegExp(`(${escapedSearch})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

}
