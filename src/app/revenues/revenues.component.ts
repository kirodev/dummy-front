import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PaymentConnection } from '../payment-connection.service';
import { PdfLibraryService, PdfFile } from '../pdf-library-service.service';
declare var Plotly: any;

interface AnnualRevenue {
  licensor: string;
  year: number;
  licensing_revenue: number;
  net_sales_source: string;
  path_1: string;
}

@Component({
  selector: 'app-revenues',
  templateUrl: './revenues.component.html',
  styleUrls: ['./revenues.component.css']
})
export class RevenuesComponent implements OnInit {
  annualRevenues: AnnualRevenue[] = [];
  pdfLibrary: PdfFile[] = [];
  isPopupVisible = false;
  popupText = '';

  constructor(
    private paymentConnection: PaymentConnection,
    private pdfLibraryService: PdfLibraryService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.fetchAnnualRevenues();
    this.fetchLibraryFiles();
    this.loadPlotlyScript();
  }

  loadPlotlyScript(): void {
    const scriptElement = document.createElement('script');
    scriptElement.src = 'https://cdn.plot.ly/plotly-2.25.2.min.js';
    scriptElement.type = 'text/javascript';
    scriptElement.onload = () => {
      this.plotData();
    };
    document.head.appendChild(scriptElement);
  }

  fetchAnnualRevenues(): void {
    this.paymentConnection.getAnnualRevenues().subscribe((data: AnnualRevenue[]) => {
      this.annualRevenues = data;
      this.plotData(); // Plot immediately if library files are already fetched
    });
  }

  fetchLibraryFiles(): void {
    this.pdfLibraryService.getExistingFiles().subscribe((files: PdfFile[]) => {
      this.pdfLibrary = files;
      this.plotData(); // Plot immediately if annual revenues are already fetched
    });
  }

  /**
   * Match shared link from PdfLibrary using normalized path and year
   */
  normalizePath(path: string): { normalizedTitle: string; normalizedYear: string } {
    if (!path) return { normalizedTitle: '', normalizedYear: '' };

    // Extract the file name
    const fileName = path.split('/').pop()?.toLowerCase() || '';
    if (!fileName.endsWith('.pdf')) return { normalizedTitle: '', normalizedYear: '' };

    // Match and extract the year (4-digit)
    const yearMatch = fileName.match(/\b(\d{4})\b/);
    const normalizedYear = yearMatch ? yearMatch[1] : '';

    // Remove year and file extension from the title
    const normalizedTitle = fileName
      .replace(/\b(\d{4})\b/, '') // Remove year
      .replace('.pdf', '') // Remove file extension
      .replace(/[\[\]()-]/g, '') // Remove special characters
      .trim();

    return { normalizedTitle, normalizedYear };
  }

  normalizeTitle(title: string): string {
    if (!title) return '';
    return title.toLowerCase().replace(/[\[\]()-]/g, '').trim();
  }

  getSharedLink(path: string, year: number): string | null {
    if (!path || !this.pdfLibrary) return null;

    // Normalize the path to extract title and year
    const { normalizedTitle, normalizedYear } = this.normalizePath(path);

    // Log for debugging
    console.log('Normalized Path:', { normalizedTitle, normalizedYear });

    // Match against the library
    const match = this.pdfLibrary.find(file => {
      const normalizedLibraryTitle = this.normalizeTitle(file.title);


      return (
        normalizedTitle.includes(normalizedLibraryTitle) &&
        year.toString() === file.year
      );
    });

    if (match) {
      console.log('Match Found:', match);
      return match.sharedLink;
    } else {
      console.warn('No match found for path:', path, 'year:', year);
      return null;
    }
  }


  /**
   * Normalize a given path to extract a comparable title
   */

  pdfLink: string = ''; // Add this property to store the link

  plotData(): void {
    if (!this.annualRevenues || this.annualRevenues.length === 0 || !this.pdfLibrary || this.pdfLibrary.length === 0) {
      console.warn('No data available to plot or library data is missing.');
      return;
    }

    const plotDiv: any = document.getElementById('plotDiv');
    if (!plotDiv) {
      console.error('Target div for Plotly graph not found.');
      return;
    }

    const dataMap = new Map<string, AnnualRevenue[]>();
    this.annualRevenues.forEach(item => {
      if (!dataMap.has(item.licensor)) {
        dataMap.set(item.licensor, []);
      }
      dataMap.get(item.licensor)!.push(item);
    });

    const traces: Partial<Plotly.PlotData>[] = [];
    const licensorColors: Map<string, string> = new Map();
    const licensors = Array.from(dataMap.keys());

    licensors.forEach((licensor, index) => {
      licensorColors.set(licensor, `hsl(${(index * 360) / licensors.length}, 70%, 50%)`);
    });

    licensors.forEach(licensor => {
      const data = dataMap.get(licensor) || [];
      const x = data.map(d => d.year);
      const y = data.map(d => d.licensing_revenue);

      // Use getSharedLink to dynamically fetch shared links
      const customData = data.map(d => [
        d.licensor,
        d.year,
        d.licensing_revenue,
        d.net_sales_source,
        d.path_1,
        this.getSharedLink(d.path_1, d.year) ?? 'N/A'
      ]);

      traces.push({
        x,
        y,
        mode: 'lines+markers',
        type: 'scatter',
        name: licensor,
        marker: { color: licensorColors.get(licensor) },
        customdata: customData, // Correct structure for Plotly
        hovertemplate: `
          <b>Year:</b> %{customdata[1]}<br>
          <b>Licensing Revenue:</b> %{customdata[2]}<br>
          <b>Net Sales Source:</b> %{customdata[3]}<br>
        `
      });
    });

    const layout: Partial<Plotly.Layout> = {
      height: 600,
      autosize: true,
      title: 'Annual Revenues Over Time',
      xaxis: {
        title: 'Year',
        tickangle: -45,
        type: 'category'
      },
      yaxis: {
        title: 'Licensing Revenue (in thousands)',
        rangemode: 'tozero'
      },
      legend: {
        traceorder: 'normal'
      }
    };

    Plotly.newPlot('plotDiv', traces, layout).then(() => {
      plotDiv.on('plotly_click', (data: any) => {
        this.handlePointClick(data);
      });
    });
  }

  handlePointClick(data: any): void {
    const point = data.points[0];
    const customData = point.customdata;

    if (!customData) {
      console.error('No custom data found for this point.');
      return;
    }

    const licensingRevenue =
      customData[2] !== undefined && !isNaN(customData[2])
        ? customData[2].toFixed(2)
        : 'N/A';

    const pdfPath = customData[4] || 'N/A';
    const pdfLink = customData[5] || 'N/A';

    const infoText = `
    <div style="text-align: left;">
      <div>
        <strong>Licensor:</strong> ${this.sanitizeHtml(customData[0] || 'N/A')}<br>
        <strong>Year:</strong> ${this.sanitizeHtml(customData[1]?.toString() || 'N/A')}<br>
        <strong>Licensing Revenue:</strong> ${licensingRevenue}<br>
        <strong>Net Sales Source:</strong> ${this.sanitizeHtml(customData[3] || 'N/A')}<br>
      </div>
      <div class="center-button">
        <a href="${pdfLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">[View Source]</a>
      </div>
    </div>
  `;
  this.showPopup(infoText);


  }

  showPopup(infoText: string): void {
    this.popupText = infoText;
    this.isPopupVisible = true;
  }

  hidePopup(): void {
    this.isPopupVisible = false;
  }

  private sanitizeHtml(input: string | undefined): string {
    if (!input) return ''; // Return empty string for undefined or null
    return input.replace(/[&<>"']/g, (char) => {
      const entities: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return entities[char];
    });
  }
}
