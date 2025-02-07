import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PaymentConnection } from '../payment-connection.service';
import { PdfLibraryService, PdfFile } from '../pdf-library-service.service';
declare var Plotly: any;

interface AnnualRevenue {
  licensor: string;
  year: number;
  total_revenue: number;
  net_sales_source_0: string;
  net_sales_path: string;
  licensing_revenue: number;
  net_sales_source: string;
  net_licenses_usd_1: number | string;
  source_1: string;
  path_1: string;
  net_licenses_usd_2: string;
  source_2: string;
  path_2: string;
  net_licenses_usd_3: string;
  source_3: string;
  path_3: string;
  net_licenses_usd_4: string;
  source_4: string;
  path_4: string;
  net_licenses_usd_5: number | string;
  source_5: string;
  path_5: string;
  net_licenses_usd_6: string;
  source_6: string;
  path_6: string;
}

@Component({
  selector: 'app-revenues',
  templateUrl: './revenues.component.html',
  styleUrls: ['./revenues.component.css'],
})
export class RevenuesComponent implements OnInit {
  annualRevenues: AnnualRevenue[] = [];
  pdfLibrary: PdfFile[] = [];
  isPopupVisible = false;
  popupText = '';
  currentPlotType: 'line' | 'stackedBar' = 'stackedBar'; // Default to stackedBar
  isLoading: boolean = true;
  isError: boolean = false;  constructor(
    private paymentConnection: PaymentConnection,
    private pdfLibraryService: PdfLibraryService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.fetchAnnualRevenues();
    this.fetchLibraryFiles();
    this.loadPlotlyScript();
    this.loadDataAndPlot();
    this.loadChart();

  }
  loadDataAndPlot(): void {
    this.isLoading = true;
    this.isError = false;

    Promise.all([
      this.paymentConnection.getAnnualRevenues().toPromise(),
      this.pdfLibraryService.getExistingFiles().toPromise(),
    ])
      .then(([annualRevenues, pdfLibrary]) => {
        if (!annualRevenues || annualRevenues.length === 0 || !pdfLibrary || pdfLibrary.length === 0) {
          throw new Error('No data available for plotting.');
        }

        this.annualRevenues = annualRevenues;
        this.pdfLibrary = pdfLibrary;
        this.loadPlotlyScript();
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.isError = true;
        this.isLoading = false; // Hide loading overlay on error
      });
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

  switchPlotType(type: 'line' | 'stackedBar' ): void {
    this.currentPlotType = type;
    this.plotData(); // Re-plot data with the selected type
  }
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

      // Prepare customData for the popup
      const customData = data.map(d => {
        const extractedYear = this.extractYearFromPath(d.path_1);
        const yearToUse = extractedYear || d.year;
        const sharedLink = this.getSharedLink(d.path_1, yearToUse, d.source_1 || '');

        return [
          d.licensor,
          d.year,
          d.licensing_revenue,
          d.net_sales_source,
          d.path_1,
          sharedLink, // Correctly fetch the shared link
          d.net_licenses_usd_1,
          d.source_1,
          d.path_1,
          d.net_licenses_usd_2,
          d.source_2,
          d.path_2,
          d.net_licenses_usd_3,
          d.source_3,
          d.path_3,
          d.net_licenses_usd_4,
          d.source_4,
          d.path_4,
          d.net_licenses_usd_5,
          d.source_5,
          d.path_5,
          d.net_licenses_usd_6,
          d.source_6,
          d.path_6
        ];
      });

      traces.push({
        x,
        y,
        type: this.currentPlotType === 'stackedBar' ? 'bar' : 'scatter',
        mode: this.currentPlotType === 'line' ? 'lines+markers' : undefined,
        name: licensor,
        marker: { color: licensorColors.get(licensor) },
        customdata: customData,
        hovertemplate: `
          <b>Licensor:</b> %{customdata[0]}<br>
          <b>Year:</b> %{customdata[1]}<br>
          <b>Licensing Revenue:</b> %{customdata[2]}<br>
          <b>Net Sales Source:</b> %{customdata[3]}<br>
          <extra>* Click To See More!</extra>
        `
      });
    });

    const layout: Partial<Plotly.Layout> = {
      height: 600,
      autosize: true,
      title: 'Annual Revenues Over Time',
      xaxis: { title: 'Year', tickangle: -45, type: 'category' },
      yaxis: { title: 'Licensing Revenue (in thousands)', rangemode: 'tozero' },
      legend: { traceorder: 'normal' },
      barmode: this.currentPlotType === 'stackedBar' ? 'stack' : undefined
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

    const year = customData[1];
    const licensor = customData[0];

    const licensesData = [
      { netLicenses: customData[6], source: customData[7], path: customData[8] },
      { netLicenses: customData[9], source: customData[10], path: customData[11] },
      { netLicenses: customData[12], source: customData[13], path: customData[14] },
      { netLicenses: customData[15], source: customData[16], path: customData[17] },
      { netLicenses: customData[18], source: customData[19], path: customData[20] },
      { netLicenses: customData[21], source: customData[22], path: customData[23] },
    ];

    let licensesHtml = '';
    licensesData.forEach((item, index) => {
      if (item.netLicenses && item.source && item.path) {
        const sharedLink = this.getSharedLink(item.path, this.extractYearFromPath(item.path) || year, item.source || '');
        licensesHtml += `
          <div>
            <strong>Net Licenses USD ${index + 1}:</strong> ${item.netLicenses || 'N/A'}<br>
            <strong>Source:</strong> ${item.source || 'N/A'}<br>
            <strong>Path:</strong> ${item.path || 'N/A'}<br>
            <a href="${sharedLink}" target="_blank" rel="noopener noreferrer" >[Go to Source]</a>
          </div>
          <hr>
        `;
      }
    });

    const infoText = `
      <div style="text-align: left;">
        <div>
          <strong>Licensor:</strong> ${this.sanitizeHtml(customData[0] || 'N/A')}<br>
          <strong>Year:</strong> ${this.sanitizeHtml(customData[1]?.toString() || 'N/A')}<br>
          <strong>Licensing Revenue:</strong> ${licensingRevenue}<br>
          <strong>Net Sales Source:</strong> ${this.sanitizeHtml(customData[3] || 'N/A')}<br>
        </div>
        <div class="center-button">
          ${licensesHtml}
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
    if (!input) return '';
    return input.replace(/[&<>"']/g, (char) => {
      const entities: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return entities[char];
    });
  }

  extractYearFromPath(path: string | null): number | null {
    if (!path) return null;
    const match = path.match(/\[(\d{4})\]/);
    return match ? parseInt(match[1], 10) : null;
  }

  getSharedLink(path: string | null, year: number, source: string): string | null {
    if (!this.pdfLibrary || !path) return null;

    // Extract the title from the path
    const extractedTitle = this.extractTitleFromPath(path);

    if (!extractedTitle) {
      console.warn(`No title extracted from path: ${path}`);
      return null;
    }

    // Find a matching file in the library based on year and title
    const match = this.pdfLibrary.find(file => {
      const normalizedLibraryTitle = file.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
      return (
        file.year.toString() === year.toString() && // Match by year
        normalizedLibraryTitle === extractedTitle // Match by normalized title
      );
    });

    if (match) {
      console.log(`Match Found: ${match.sharedLink}`);
      return match.sharedLink;
    } else {
      console.warn(`No match found for Path: ${path}, Title: ${extractedTitle}, Year: ${year}`);
      return null;
    }
  }


  extractTitleFromPath(path: string): string {
    if (!path) return '';

    // Extract portion after [year] and before .pdf
    const match = path.match(/\[\d{4}\]\s*(.*)\.pdf$/i);
    return match && match[1] ? match[1].toLowerCase().replace(/[^a-z0-9\s]/g, '').trim() : '';
  }


  loadChart(): void {
    this.isLoading = true; // Show loading overlay

    setTimeout(() => {
      this.plotData(); // Plot the chart when data is ready
      this.isLoading = false; // Hide loading overlay
    }, 2000); // Adjust the timeout as needed based on fetch time
  }



}
