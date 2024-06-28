import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PdfLibraryService } from '../pdf-library-service.service';
import { ExamplePdfViewerComponent } from '../example-pdf-viewer/example-pdf-viewer.component';

interface PdfFile {
  path: string;
  name: string;
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

  constructor(private pdfLibraryService: PdfLibraryService) {}

  ngOnInit(): void {
    this.loadPdfFiles();
  }

  loadPdfFiles(): void {
    this.pdfLibraryService.getPdfFiles().subscribe(files => {
      this.pdfFiles = files;
      this.filteredPdfFiles = files;
    });
  }

  searchFiles(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredPdfFiles = this.pdfFiles.filter(file =>
      file.name.toLowerCase().includes(query)
    );
  }

  openPDFViewer(file: PdfFile): void {
    const directory_path = file.path.replace('C:/Users/Karim/frontend/dummy-front/src/', ''); // Remove the src/ part
    const details = file.name; // Assuming file.name contains the details
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
