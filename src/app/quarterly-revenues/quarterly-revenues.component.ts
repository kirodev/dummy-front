// src/app/quarterly-revenues/quarterly-revenues.component.ts

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

  constructor(private paymentConnection: PaymentConnection) { }

  ngOnInit(): void {
    this.fetchQuarterlyRevenues();
    this.loadPlotlyScript().then(() => {
      console.log('Plotly.js script loaded successfully');
      // Only plot after both the script and data are loaded
      if (this.quarterlyRevenues.length > 0) {
        this.plotData();
      }
    }).catch(error => {
      console.error('Error loading Plotly.js script:', error);
    });
  }

  // Function to load Plotly.js script dynamically
  loadPlotlyScript(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (typeof Plotly !== 'undefined') {
        resolve(); // If Plotly is already loaded, resolve immediately
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

  // Fetch quarterly revenues
  fetchQuarterlyRevenues(): void {
    this.paymentConnection.getQuarterlyRevenues().subscribe(
      (data: QuarterlyRevenue[]) => {
        this.quarterlyRevenues = data;
        // Check if Plotly is already loaded
        if (typeof Plotly !== 'undefined') {
          this.plotData(); // Plot after data is fetched
        }
      },
      (error) => {
        console.error('Error fetching quarterly revenues:', error);
      }
    );
  }

  // Helper function to generate distinct colors
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

  // Plot quarterly data
  plotData(): void {
    if (this.plotRendered) return; // Prevent re-rendering

    const chartElement = document.getElementById('quarterlyRevenuesChart');
    if (!chartElement) {
      console.error('Element with ID "quarterlyRevenuesChart" not found.');
      return;
    }

    const companyQuarterRevenueMap = new Map<string, Map<string, number>>();
    const companyColors: Map<string, string> = new Map();

    // Filter out Samsung Electronics Co., Ltd. data
    const filteredRevenues = this.quarterlyRevenues.filter(item => item.licensor !== 'Samsung Electronics Co., Ltd.');

    // Get unique companies
    const companies = Array.from(new Set(filteredRevenues.map(item => item.licensor)));
    const colors = this.generateDistinctColors(companies.length);
    companies.forEach((company, index) => {
      companyColors.set(company, colors[index]);
    });

    // Aggregate revenue per company per quarter-year
    filteredRevenues.forEach(item => {
      const yearQuarter = `${item.quarter} ${item.year}`;
      const company = item.licensor;
      const revenue = item.revenue;

      if (!companyQuarterRevenueMap.has(company)) {
        companyQuarterRevenueMap.set(company, new Map());
      }
      companyQuarterRevenueMap.get(company)!.set(yearQuarter, revenue);
    });

    // Get unique quarter-year labels sorted chronologically
    const uniqueYearQuarters = Array.from(new Set(filteredRevenues.map(item => `Q${item.quarter} ${item.year}`)))
                                     .sort(this.sortQuarterYear);

    // Create traces for each company
    const traces: Partial<Plotly.PlotData>[] = [];

    companyQuarterRevenueMap.forEach((yearQuarterRevenueMap, company) => {
      const revenues: number[] = [];

      uniqueYearQuarters.forEach(yearQuarter => {
        revenues.push(yearQuarterRevenueMap.get(yearQuarter) ?? 0);
      });

      traces.push({
        x: uniqueYearQuarters,
        y: revenues,
        type: 'bar',
        name: company,
        marker: { color: companyColors.get(company) ?? '#000000' },
      });
    });

    const layout: Partial<Plotly.Layout> = {
      autosize: true,
      title: 'Quarterly Revenues by Year',
      barmode: 'stack',
      xaxis: {
        title: 'Quarters',
        tickangle: -45,
        automargin: true
      },
      yaxis: {
        title: 'Revenue',
        rangemode: 'tozero',
        automargin: true
      },
      legend: {
        orientation: 'v',        // Vertical orientation
        x: 1.02,                 // Position to the right of the plot
        y: 1,                    // Align to the top
        bgcolor: 'rgba(255, 255, 255, 0.5)', // Optional: semi-transparent background
        bordercolor: '#FFFFFF',  // Optional: border color
        borderwidth: 1           // Optional: border width
      },
      margin: {
        l: 50,
        r: 150, // Increased right margin to accommodate the legend
        t: 50,
        b: 100
      }
    };

    const config = { responsive: true };

    Plotly.newPlot('quarterlyRevenuesChart', traces, layout, config).catch((error: any) => {
      console.error('Error plotting graph:', error);
    });

    this.plotRendered = true; // Mark as rendered
  }

  // Helper function to sort quarter-year labels chronologically
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
}
