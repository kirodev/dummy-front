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
    this.pdfLibraryService.getPdfFiles().subscribe({
      next: (response: any) => {
        if (!Array.isArray(response)) {
          console.error('API response is not an array:', response);
          return;
        }

        const files = response as PdfFile[];

        console.log('Loaded PDF files:', files);

        this.pdfFiles = files.map((file: PdfFile) => {
          if (!file.directory_path) {
            console.error('File directory_path is missing for file:', file);
            return {
              ...file,
              title: 'Unknown Title',
              date: 'Unknown Year'
            };
          }

          const fullName = file.directory_path.split('\\').pop() || '';
          const title = fullName.replace('.pdf', '') || 'Unknown Title';
          const yearMatch = file.directory_path.match(/\b\d{4}\b/);
          const year = yearMatch ? yearMatch[0] : 'Unknown Year';

          return {
            ...file,
            title: title,
            date: year
          };
        });

        console.log('Processed PDF files:', this.pdfFiles);

        this.filteredPdfFiles = this.pdfFiles;
        console.log('Filtered PDF files:', this.filteredPdfFiles);
      },
      error: (err: any) => {
        console.error('Error loading PDF files', err);
      }
    });
  }

  searchFiles(): void {
    const query = this.searchQuery.toLowerCase();
    console.log('Search Query:', query);
    console.log('Search Flags:', {
      searchByTitle: this.searchByTitle,
      searchByDate: this.searchByDate,
      searchByDetails: this.searchByDetails
    });

    this.filteredPdfFiles = this.pdfFiles.filter((file: PdfFile) => {
      const titleMatch = this.searchByTitle && file.title ? file.title.toLowerCase().includes(query) : true;
      const dateMatch = this.searchByDate && file.date ? file.date.toLowerCase().includes(query) : true;
      const detailsMatch = this.searchByDetails && file.details ? file.details.toLowerCase().includes(query) : true;

      console.log('File:', file);
      console.log('Matches:', {
        titleMatch,
        dateMatch,
        detailsMatch
      });

      const matchesQuery = (this.searchByTitle && titleMatch) ||
                           (this.searchByDate && dateMatch) ||
                           (this.searchByDetails && detailsMatch) ||
                           (!this.searchByTitle && !this.searchByDate && !this.searchByDetails);

      const reportTypeMatch = this.selectedReportType ? file.directory_path?.includes(this.selectedReportType) : true;

      console.log('Report Type Match:', reportTypeMatch);

      return matchesQuery && reportTypeMatch;
    });

    console.log('Filtered PDF files after search:', this.filteredPdfFiles);
  }


  openPDFViewer(file: PdfFile): void {
    if (!file.directory_path) {
      console.error('File path is undefined for file:', file);
      return;
    }

    const directory_path = file.directory_path.replace(/^.*[\\\/]/, ''); // Remove leading path
    const url = `/assets/${directory_path}`;
    this.pdfSrc = url;
    this.showPDFViewerPopup();
  }

  showPDFViewer: boolean = false;
  showPopup: boolean = false;

  showPDFViewerPopup(): void {
    this.showPDFViewer = true;
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
    this.showPDFViewer = false;
  }
}
