import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';

@Injectable({
  providedIn: 'root', // You can specify a different providedIn if needed
})
export class PdfService {
  private pdfSource = 'assets/unwired planet v Huawei Technologies Co., Ltd. UK High Court main decisio (1).pdf';

  constructor() {}

  openPdf(pageNumber: number): void {
    // Initialize PDFJS
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.js'; // Specify the path to your worker script

    // Create a reference to the canvas element where the PDF will be rendered
    const canvas = document.getElementById('pdfCanvas') as HTMLCanvasElement;

    // Load the PDF document
    pdfjsLib.getDocument(this.pdfSource).promise.then((pdfDocument: any) => {
      // Fetch the desired page
      pdfDocument.getPage(pageNumber).then((pdfPage: any) => {
        // Set the scale and context for rendering
        const scale = 1.5; // You can adjust the scale as needed
        const context = canvas.getContext('2d');

        // Calculate the viewport
        const viewport = pdfPage.getViewport({ scale });

        // Set the canvas dimensions to match the viewport
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render the PDF page on the canvas
        pdfPage.render({ canvasContext: context, viewport });
      });
    });
  }
}
