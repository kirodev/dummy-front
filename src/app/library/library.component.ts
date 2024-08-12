import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PdfLibraryService } from '../pdf-library-service.service';
import { ExamplePdfViewerComponent } from '../example-pdf-viewer/example-pdf-viewer.component';

interface PdfFile {
  path: string;
  name: string;
  title?: string;
  date?: string;
  details?: string;
  directory_path?: string;
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
            // Extract title from the text after the last backslash
            const lastBackslashIndex = file.directory_path.lastIndexOf('\\');
            if (lastBackslashIndex !== -1) {
              title = file.directory_path.substring(lastBackslashIndex + 1).replace('.pdf', '') || 'Unknown Title';
            }

            // Extract date (year) from the path
            const dateMatch = file.directory_path.match(/\b\d{4}\b/);
            if (dateMatch) {
              date = dateMatch[0];
            }
          }

          return {
            ...file,
            title: title,
            date: date,
            showDetails: false
          };
        });

        // Group files by title and date
        const uniqueFilesMap = new Map<string, PdfFile[]>();

        this.pdfFiles.forEach((file: PdfFile) => {
          const key = `${file.title}_${file.date}`;

          if (uniqueFilesMap.has(key)) {
            uniqueFilesMap.get(key)?.push(file);
          } else {
            uniqueFilesMap.set(key, [file]);
          }
        });

        // Merge files with the same title and date
        this.pdfFiles = Array.from(uniqueFilesMap.values()).map(groupedFiles => {
          const baseFile = groupedFiles[0]; // Take the first file as the base
          const combinedDetails = groupedFiles
            .map(f => f.details)
            .filter(Boolean)
            .join('\n---\n'); // Join details with a separator

          return {
            ...baseFile,
            details: combinedDetails || baseFile.details,
            showDetails: false
          };
        });

        // Set filtered files to all files initially
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

    const filePath = file.directory_path;

    this.pdfLibraryService.checkFileExistsInAssets(filePath).subscribe(existsInAssets => {
      if (existsInAssets) {
        const url = `/assets/${encodeURIComponent(filePath)}`;
        console.log('Constructed PDF URL:', url); // Log the constructed URL for debugging

        // Open the PDF file in a new sub-browser window
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
    event.stopPropagation(); // Prevent clicking the card from triggering other actions
    file.showDetails = !file.showDetails;
  }

}
