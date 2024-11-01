// example-pdf-viewer.component.ts

import { Component, ViewChild, AfterViewInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { NgxExtendedPdfViewerComponent, NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-example-pdf-viewer',
  templateUrl: './example-pdf-viewer.component.html',
  styleUrls: ['./example-pdf-viewer.component.css']
})
export class ExamplePdfViewerComponent implements AfterViewInit, OnChanges {
  @ViewChild(NgxExtendedPdfViewerComponent, { static: false }) pdfViewer!: NgxExtendedPdfViewerComponent;
  @Input() pdfSrc: string = '';

  @Output() pdfLoaded = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();

  searchText: string = '';
  isLoading: boolean = false; // Loading flag
  private hasEmittedPdfLoaded: boolean = false; // Prevents multiple emissions
  private lastPageNumber: number | null = null; // Tracks the last known page number
  private hasPageChangedOnce: boolean = false; // Tracks if the first page change has occurred

  constructor(private pdfViewerService: NgxExtendedPdfViewerService) {}

  ngAfterViewInit(): void {
    if (this.pdfViewer) {
      // Subscribe to the pdfLoaded event from ngx-extended-pdf-viewer
      this.pdfViewer.pdfLoaded.subscribe(() => {
        this.onPdfLoaded();
      });

      // Subscribe to the pageChange event from ngx-extended-pdf-viewer
      this.pdfViewer.pageChange.subscribe((pageNumber: number) => {
        this.onPageChange(pageNumber);
      });
    } else {
      console.error('PDF viewer is not initialized.');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pdfSrc']) {
      // Reset the flags and show loading when a new PDF is loaded
      this.hasEmittedPdfLoaded = false;
      this.hasPageChangedOnce = false;
      this.isLoading = true;
      this.lastPageNumber = null; // Reset last page number for new PDF
    }
  }

  onPdfLoaded(): void {
    if (!this.hasEmittedPdfLoaded) {
      this.isLoading = false; // Hide loading overlay
      this.hasEmittedPdfLoaded = true; // Prevent multiple emissions
      console.log('PDF fully loaded!');
      this.pdfLoaded.emit(); // Emit event to parent

      if (this.searchText) {
        this.triggerSearch();
      }
    }
  }

  searchPDF(text: string): void {
    this.searchText = text;
    if (this.hasEmittedPdfLoaded) {
      this.triggerSearch();
    } else {
      // If the PDF isn't loaded yet, loading overlay will be handled in onPdfLoaded
      this.isLoading = true;
    }
  }

  triggerSearch(): void {
    if (this.pdfViewerService && this.pdfViewerService.find) {
      this.isLoading = true; // Show loading during search
      this.pdfViewerService.find(this.searchText);
      // Hide loading after a short delay to simulate search processing
      setTimeout(() => {
        this.isLoading = false;
        console.log(`Search completed for text: ${this.searchText}`);
      }, 500); // Adjust the delay as needed
    } else {
      console.error('PDF search functionality is not available.');
      this.isLoading = false; // Hide loading if search fails
    }
  }

  onPageChange(pageNumber: number): void {
    if (this.lastPageNumber !== pageNumber) {
      this.lastPageNumber = pageNumber; // Update the last known page number

      if (!this.hasPageChangedOnce) {
        this.isLoading = true; // Show loading overlay only for the first page change
        this.hasPageChangedOnce = true; // Set the flag to prevent future loading overlays
        console.log(`Page changed to: ${pageNumber}`);

        // Hide loading after a short delay to simulate page load time
        setTimeout(() => {
          this.isLoading = false;
          console.log(`Loading completed for page: ${pageNumber}`);
        }, 500); // Adjust the delay as needed
      } else {
        // Optional: Log that the page change is being ignored for loading
        console.log(`Page changed to: ${pageNumber} (Loading overlay not shown)`);
      }
    } else {
      // Optional: Log that the page hasn't changed
      console.log(`Scrolled within the same page: ${pageNumber}`);
    }
  }
}
