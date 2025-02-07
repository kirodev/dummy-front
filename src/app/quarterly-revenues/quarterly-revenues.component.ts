import { Component, OnInit } from '@angular/core';
import { PaymentConnection } from '../payment-connection.service';
declare var Plotly: any;

interface QuarterlyRevenue {
  id: number;
  licensor: string;
  year: number;
  quarter: string;
  revenue: number;
}

@Component({
  selector: 'app-quarterly-revenues',
  templateUrl: './quarterly-revenues.component.html',
  styleUrls: ['./quarterly-revenues.component.css']
})
export class QuarterlyRevenuesComponent implements OnInit {
  quarterlyRevenues: QuarterlyRevenue[] = [];
  plotRendered: boolean = false;
  currentPlotType: 'bar' | 'line' = 'bar';
  isLoading: boolean = true;

  constructor(private paymentConnection: PaymentConnection) {}

  ngOnInit(): void {
    this.fetchQuarterlyRevenues();
    this.loadPlotlyScript()
      .then(() => {
        console.log('Plotly.js script loaded successfully');
        if (this.quarterlyRevenues.length > 0) {
          this.plotData();
        }
      })
      .catch((error) => {
        console.error('Error loading Plotly.js script:', error);
      });
      this.loadChart();

  }

  loadPlotlyScript(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (typeof Plotly !== 'undefined') {
        resolve();
      } else {
        const scriptElement = document.createElement('script');
        scriptElement.src = 'https://cdn.plot.ly/plotly-2.25.2.min.js';
        scriptElement.type = 'text/javascript';
        scriptElement.onload = () => resolve();
        scriptElement.onerror = (event: Event | string) => reject(event);
        document.head.appendChild(scriptElement);
      }
    });
  }

  fetchQuarterlyRevenues(): void {
    this.paymentConnection.getQuarterlyRevenues().subscribe(
      (data: QuarterlyRevenue[]) => {
        this.quarterlyRevenues = data;
        if (typeof Plotly !== 'undefined') {
          this.plotData();
        }
      },
      (error) => {
        console.error('Error fetching quarterly revenues:', error);
      }
    );
  }

  generateDistinctColors(count: number): string[] {
    const colors = [];
    const hueStep = 360 / count;
    for (let i = 0; i < count; i++) {
      const hue = i * hueStep;
      const color = `hsl(${hue}, 70%, 50%)`;
      colors.push(color);
    }
    return colors;
  }

  plotData(): void {
    const chartElement = document.getElementById('quarterlyRevenuesChart');
    if (!chartElement) {
      console.error('Element with ID "quarterlyRevenuesChart" not found.');
      return;
    }

    const companyQuarterRevenueMap = new Map<string, Map<string, number>>();
    const companyColors: Map<string, string> = new Map();
    const filteredRevenues = this.quarterlyRevenues.filter(item => item.licensor !== 'Samsung Electronics Co., Ltd.');

    const companies = Array.from(new Set(filteredRevenues.map(item => item.licensor)));
    const colors = this.generateDistinctColors(companies.length);
    companies.forEach((company, index) => {
      companyColors.set(company, colors[index]);
    });

    filteredRevenues.forEach(item => {
      const yearQuarter = `${item.quarter} ${item.year}`;
      const company = item.licensor;
      const revenue = item.revenue;

      if (!companyQuarterRevenueMap.has(company)) {
        companyQuarterRevenueMap.set(company, new Map());
      }
      companyQuarterRevenueMap.get(company)!.set(yearQuarter, revenue);
    });

    const uniqueYearQuarters = Array.from(new Set(filteredRevenues.map(item => `${item.quarter} ${item.year}`)))
                                     .sort(this.sortQuarterYear);

    const traces: Partial<Plotly.PlotData>[] = [];

    companyQuarterRevenueMap.forEach((yearQuarterRevenueMap, company) => {
      const revenues: number[] = [];

      uniqueYearQuarters.forEach(yearQuarter => {
        revenues.push(yearQuarterRevenueMap.get(yearQuarter) ?? 0);
      });

      traces.push({
        x: uniqueYearQuarters,
        y: revenues,
        type: this.currentPlotType as Plotly.PlotType, // Cast to PlotType
        name: company,
        marker: { color: companyColors.get(company) ?? '#000000' },
      });
    });

    const layout: Partial<Plotly.Layout> = {
      autosize: true,
      title: 'Quarterly Revenues by Year',
      barmode: this.currentPlotType === 'bar' ? 'stack' : undefined,
      xaxis: {
        title: 'Quarters',
        tickangle: -45,
        automargin: true,
      },
      yaxis: {
        title: 'Revenue (in thousands)',
        rangemode: 'tozero',
        automargin: true,
      },
      legend: {
        orientation: 'v',
        x: 1.02,
        y: 1,
        bgcolor: 'rgba(255, 255, 255, 0.5)',
        bordercolor: '#FFFFFF',
        borderwidth: 1,
      },
      margin: {
        l: 50,
        r: 150,
        t: 50,
        b: 100,
      },
    };

    const config = { responsive: true };

    Plotly.newPlot('quarterlyRevenuesChart', traces, layout, config).catch((error: any) => {
      console.error('Error plotting graph:', error);
    });

    this.plotRendered = true;
  }

  togglePlotType(): void {
    this.currentPlotType = this.currentPlotType === 'bar' ? 'line' : 'bar';
    this.plotRendered = false; // Reset the render flag
    this.plotData(); // Re-render the chart
  }

  sortQuarterYear(a: string, b: string): number {
    const [qA, yearA] = a.split(' ');
    const [qB, yearB] = b.split(' ');

    const yearNumA = parseInt(yearA, 10);
    const yearNumB = parseInt(yearB, 10);

    if (yearNumA !== yearNumB) {
      return yearNumA - yearNumB;
    }

    const quarterA = parseInt(qA.replace('Q', ''), 10);
    const quarterB = parseInt(qB.replace('Q', ''), 10);

    return quarterA - quarterB;
  }

  loadChart(): void {
    this.isLoading = true; // Show loading overlay

    setTimeout(() => {
      this.plotData(); // Plot the chart when data is ready
      this.isLoading = false; // Hide loading overlay
    }, 2000); // Adjust the timeout as needed based on fetch time
  }


}
