import { Component, ViewChild, AfterViewInit, Input } from '@angular/core';
import { NgxExtendedPdfViewerComponent, NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-example-pdf-viewer',
  templateUrl: './example-pdf-viewer.component.html',
  styleUrls: ['./example-pdf-viewer.component.css']
})
export class ExamplePdfViewerComponent implements AfterViewInit {
  @ViewChild(NgxExtendedPdfViewerComponent, { static: false }) pdfViewer!: NgxExtendedPdfViewerComponent;
  @Input() documentName: string = '';
  @Input() pdfSrc: string = '';

  searchText: string = '';  // To store the search term

  constructor(private pdfViewerService: NgxExtendedPdfViewerService) { }

  ngAfterViewInit(): void {}

  searchPDF(text: string): void {
    // Store the search term in a variable to use it once the PDF is loaded
    this.searchText = text;

    // Wait for the PDF to load, then trigger the search
    if (this.pdfViewer) {
      this.pdfViewer.pdfLoaded.subscribe(() => {
        if (this.pdfViewerService && this.pdfViewerService.find) {
          this.pdfViewerService.find(this.searchText);
        } else {
          console.error('PDF search functionality is not available.');
        }
      });
    } else {
      console.error('PDF viewer is not initialized.');
    }
  }
}
