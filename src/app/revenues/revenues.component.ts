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
  net_licenses_usd_1: number | string;  // Handle both number and string types
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
  net_licenses_usd_5: number | string;  // Handle both number and string types
  source_5: string;
  path_5: string;
  net_licenses_usd_6: string;
  source_6: string;
  path_6: string;
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
  normalizePath(path: string): string {
    if (!path) return '';

    // Remove the file extension (.pdf) and special characters like brackets, spaces, etc.
    return path.toLowerCase()
      .replace(/[\[\]()-]/g, '') // Remove square brackets, parentheses, hyphens
      .replace(/\\| /g, '')       // Remove backslashes and spaces
      .replace('.pdf', '')        // Remove the file extension
      .trim();
  }

  normalizeTitle(title: string): string {
    if (!title) return '';
    return title.toLowerCase()
      .replace(/[\[\]()-]/g, '') // Remove square brackets, parentheses, hyphens
      .replace(/\s/g, '')         // Remove all spaces
      .trim();
  }




  getSharedLink(path: string, year: number): string | null {
    if (!path || !this.pdfLibrary) return null;

    // Normalize both the path and the title from the database and the PDF library
    const normalizedPath = this.normalizePath(path);

    // Match against the library
    const match = this.pdfLibrary.find(file => {
      const normalizedLibraryTitle = this.normalizeTitle(file.title);
      const normalizedLibraryPath = this.normalizePath(file.path);  // Normalize the path in the library

      return (
        normalizedPath.includes(normalizedLibraryPath) && // Compare normalized paths
        year.toString() === file.year.toString()           // Compare years
      );
    });

    if (match) {
      return match.sharedLink;
    } else {
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

      // Add all fields to customData
      const customData = data.map(d => [
        d.licensor,
        d.year,
        d.licensing_revenue,
        d.net_sales_source,
        d.path_1,
        this.getSharedLink(d.path_1, d.year) ?? 'N/A',
        d.net_licenses_usd_1, // Include net_licenses_usd_1
        d.source_1,           // Include source_1
        d.path_1,             // Include path_1
        d.net_licenses_usd_2, // Include net_licenses_usd_2
        d.source_2,           // Include source_2
        d.path_2,             // Include path_2
        d.net_licenses_usd_3, // Include net_licenses_usd_3
        d.source_3,           // Include source_3
        d.path_3,             // Include path_3
        d.net_licenses_usd_4, // Include net_licenses_usd_4
        d.source_4,           // Include source_4
        d.path_4,             // Include path_4
        d.net_licenses_usd_5, // Include net_licenses_usd_5
        d.source_5,           // Include source_5
        d.path_5,             // Include path_5
        d.net_licenses_usd_6, // Include net_licenses_usd_6
        d.source_6,           // Include source_6
        d.path_6              // Include path_6
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
          <b>Licensor:</b> %{customdata[0]}<br>
          <b>Year:</b> %{customdata[1]}<br>
          <b>Licensing Revenue:</b> %{customdata[2]}<br>
          <b>Net Sales Source:</b> %{customdata[3]}<br>
          <extra>* Click To See More !</extra>
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

    console.log('Custom Data:', customData);  // Log to verify the structure

    if (!customData) {
      console.error('No custom data found for this point.');
      return;
    }

    const licensingRevenue =
      customData[2] !== undefined && !isNaN(customData[2])
        ? customData[2].toFixed(2)
        : 'N/A';

    const year = customData[1]; // Get the year from customData
    const licensor = customData[0]; // Get the licensor

    // Dynamically generate the infoText for each net_licenses_usd with corresponding source, path, and shared link
    const licensesData = [
      { netLicenses: customData[6], source: customData[7], path: customData[8] },
      { netLicenses: customData[9], source: customData[10], path: customData[11] },
      { netLicenses: customData[12], source: customData[13], path: customData[14] },
      { netLicenses: customData[15], source: customData[16], path: customData[17] },
      { netLicenses: customData[18], source: customData[19], path: customData[20] },
      { netLicenses: customData[21], source: customData[22], path: customData[23] },
      { netLicenses: customData[24], source: customData[25], path: customData[26] },
      { netLicenses: customData[27], source: customData[28], path: customData[29] },
      { netLicenses: customData[30], source: customData[31], path: customData[32] },
      { netLicenses: customData[33], source: customData[34], path: customData[35] },
      { netLicenses: customData[36], source: customData[37], path: customData[38] },
      { netLicenses: customData[39], source: customData[40], path: customData[41] }
    ];

    let licensesHtml = '';
    licensesData.forEach((item, index) => {
      if (item.netLicenses && item.source && item.path) {
        const sharedLink = this.getSharedLink(item.path, customData[1]); // Pass path and year to get the shared link
        licensesHtml += `
          <div>
            <strong>Net Licenses USD ${index + 1}:</strong> ${item.netLicenses || 'N/A'}<br>
            <strong>Source:</strong> ${item.source || 'N/A'}<br>
            <strong>Path:</strong> ${item.path || 'N/A'}<br>
            <a href="${sharedLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">[Go to Source]</a>
          </div>
          <hr>
        `;
      }
    });

    // Create the popup content including licensing data
    const infoText = `
      <div style="text-align: left;">
        <div>
          <strong>Licensor:</strong> ${this.sanitizeHtml(customData[0] || 'N/A')}<br>
          <strong>Year:</strong> ${this.sanitizeHtml(customData[1]?.toString() || 'N/A')}<br>
          <strong>Licensing Revenue:</strong> ${licensingRevenue}<br>
          <strong>Net Sales Source:</strong> ${this.sanitizeHtml(customData[3] || 'N/A')}<br>
        </div>
        <div class="center-button">
          ${licensesHtml} <!-- Add dynamically generated license data here -->
        </div>
      </div>
    `;

    this.showPopup(infoText); // Show the popup with generated content
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
