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

  constructor(private pdfViewerService: NgxExtendedPdfViewerService) { }

  ngAfterViewInit(): void {

  }

  searchPDF(text: string): void {
    // Check if pdfViewer and pdfViewerService are available
    if (this.pdfViewer && this.pdfViewerService && this.pdfViewerService.find) {
      this.pdfViewerService.find(text);
    } else {
      console.error('PDF viewer is not initialized or search functionality is not available.');
    }
  }
}
