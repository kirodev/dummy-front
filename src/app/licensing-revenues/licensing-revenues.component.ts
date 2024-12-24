import { Component, OnInit } from '@angular/core';
import { PaymentConnection } from '../payment-connection.service'; // Adjust import as needed
declare var Plotly: any;

interface PaymentEntry {
  year: number;
  payment: number;
}

interface RevenueEntry {
  licensor: string;
  year: number;
  licensing_revenue: number;
  net_sales_source: string;
  path_1: string;
  source_1: string;
}

@Component({
  selector: 'app-licensing-revenues',
  templateUrl: './licensing-revenues.component.html',
  styleUrls: ['./licensing-revenues.component.css'],
})
export class LicensingRevenuesComponent implements OnInit {
  licensors: string[] = [];
  selectedLicensor: string = '';
  paymentData: PaymentEntry[] = [];
  annualRevenues: RevenueEntry[] = [];
  filteredPayments: PaymentEntry[] = [];
  isLoading: boolean = true;
  isPopupVisible: boolean = false;
  popupText: string = '';

  constructor(private paymentConnection: PaymentConnection) {}

  ngOnInit(): void {
    this.fetchLicensors(() => {
      if (this.licensors.length > 0) {
        this.selectedLicensor = this.licensors[0];
        this.onLicensorChange();
      }
    });
    this.fetchPayments();
    this.loadPlotlyScript().catch((error: unknown) =>
      console.error('Failed to load Plotly.js:', error)
    );
  }

  fetchLicensors(callback?: () => void): void {
    this.isLoading = true;
    this.paymentConnection.getAnnualRevenues().subscribe(
      (data: RevenueEntry[]) => {
        this.annualRevenues = data;
        this.licensors = [...new Set(data.map((item) => item.licensor))].sort();
        this.isLoading = false;
        if (callback) callback();
      },
      (error) => {
        console.error('Error fetching licensors:', error);
        this.isLoading = false;
      }
    );
  }

  fetchPayments(): void {
    this.paymentConnection.getPayments().subscribe(
      (data: PaymentEntry[]) => {
        this.paymentData = data;
      },
      (error) => {
        console.error('Error fetching payments:', error);
      }
    );
  }

  onLicensorChange(): void {
    if (!this.selectedLicensor) return;

    const normalizedLicensor = this.normalizeLicensorName(this.selectedLicensor);
    const selectedLicensorRevenues = this.annualRevenues.filter(
      (item) =>
        this.normalizeLicensorName(item.licensor) === normalizedLicensor
    );
    this.plotData(selectedLicensorRevenues);
  }

  plotData(selectedLicensorRevenues: RevenueEntry[]): void {
    const traces = this.createPlotlyTraces(selectedLicensorRevenues);
    const layout = this.createPlotlyLayout();

    Plotly.newPlot('annualRevenuesChart', traces, layout)
      .then(() => {
        const chartDiv = document.getElementById('annualRevenuesChart');
        if (chartDiv) {
          console.log('Chart div found, attaching click listener.');
          Plotly.d3.select(chartDiv).on('plotly_click', (data: any) => {
            console.log('Plotly click event triggered:', data);
            this.handlePointClick(data);
          });
        } else {
          console.error('Chart div not found, click listener not attached.');
        }
      })
      .catch((error: unknown) => {
        console.error('Error plotting graph:', error);
      });
  }


  createPlotlyTraces(data: RevenueEntry[]): Partial<Plotly.PlotData>[] {
    const companyYearRevenueMap = new Map<string, Map<number, RevenueEntry>>();
    const companyColors = this.generateCompanyColors(data);

    data.forEach((item) => {
      const yearMap = companyYearRevenueMap.get(item.licensor) ?? new Map();
      yearMap.set(item.year, item);
      companyYearRevenueMap.set(item.licensor, yearMap);
    });

    const uniqueYears = Array.from(
      new Set(data.map((item) => item.year))
    ).sort((a, b) => a - b);

    return Array.from(companyYearRevenueMap.entries()).map(([company, yearMap]) => {
      const years = uniqueYears;
      const revenues = years.map((year) => yearMap.get(year)?.licensing_revenue ?? 0);

      // Serialize custom data to strings
      const customData = years.map((year) => {
        const item = yearMap.get(year);
        return JSON.stringify({
          licensing_revenue: item?.licensing_revenue ?? 0,
          net_sales_source: item?.net_sales_source ?? 'N/A',
          path_1: item?.path_1 ?? 'N/A',
          source_1: item?.source_1 ?? 'N/A',
        });
      });

      return {
        x: years,
        y: revenues,
        type: 'bar',
        name: company,
        marker: { color: companyColors.get(company) ?? '#000' },
        customdata: customData,
        hoverinfo: 'none',
      };
    });
  }


  createPlotlyLayout(): Partial<Plotly.Layout> {
    return {
      autosize: true,
      title: 'Licensing Revenues by Year',
      xaxis: { title: 'Year', type: 'category' },
      yaxis: { title: 'Licensing Revenue', rangemode: 'tozero' },
      barmode: 'stack',
    };
  }

  generateCompanyColors(data: RevenueEntry[]): Map<string, string> {
    const companies = Array.from(new Set(data.map((item) => item.licensor)));
    const colors = this.generateDistinctColors(companies.length);
    return new Map(companies.map((company, i) => [company, colors[i]]));
  }

  generateDistinctColors(count: number): string[] {
    const colors = [];
    const hueStep = 360 / count;
    for (let i = 0; i < count; i++) {
      const hue = i * hueStep;
      colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
  }

  handlePointClick(data: any): void {
    const point = data.points[0];
    console.log('Clicked point data:', point); // Debugging clicked point data

    const customData = JSON.parse(point.customdata); // Parse the serialized string
    console.log('Parsed custom data:', customData); // Debugging parsed custom data

    const infoText = `
      <strong>Licensing Revenue:</strong> ${customData.licensing_revenue}<br>
      <strong>Net Sales Source:</strong> ${customData.net_sales_source}<br>
      <strong>Path:</strong> ${customData.path_1}<br>
      <strong>Source:</strong> ${customData.source_1}
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

  loadPlotlyScript(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (typeof Plotly !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.plot.ly/plotly-2.25.2.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Plotly.js'));
      document.head.appendChild(script);
    });
  }

  normalizeLicensorName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/gi, ''); // Remove special characters
  }
}
