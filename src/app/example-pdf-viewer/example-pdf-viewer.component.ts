import { Component, ViewChild, AfterViewInit,Input  } from '@angular/core';
import { NgxExtendedPdfViewerComponent, NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { take } from 'rxjs/operators';


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
    this.pdfViewer.pdfLoaded.pipe(take(0)).subscribe(() => {
      this.searchPDF('');
    });
  }

  searchPDF(text: string): void {
    if (this.pdfViewer ) {
      this.pdfViewerService.find(text);
    } else {
      console.error('PDF viewer is not initialized.');
    }
  }
  

}
