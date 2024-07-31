// src/app/revenues/revenues.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { PaymentConnection } from '../payment-connection.service';
declare var Plotly: any;

interface AnnualRevenue {
  id: number;
  licensor: string;
  year: number;
  totalRevenue: number;
  licensingRevenue: number;
  recurringRevenue: number;
  fixedFee: number;
  perUnit: number;
  pastSales: number;
}

interface Trace {
  x: number[];
  y: number[];
  type: string;
  name: string;
  marker: { color: string };
  text: string;
  hoverinfo: string;
}

@Component({
  selector: 'app-revenues',
  templateUrl: './revenues.component.html',
  styleUrls: ['./revenues.component.css']
})
export class RevenuesComponent implements OnInit {

  annualRevenues: AnnualRevenue[] = [];

  constructor(
    private paymentConnection: PaymentConnection,
    private http: HttpClient,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.fetchAnnualRevenues();
    this.loadPlotlyScript().then(() => {
      console.log('Plotly.js script loaded successfully');
      this.plotData();
    }).catch(error => {
      console.error('Error loading Plotly.js script:', error);
    });
  }

  loadPlotlyScript(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const scriptElement = document.createElement('script');
      scriptElement.src = 'https://cdn.plot.ly/plotly-2.25.2.min.js';
      scriptElement.type = 'text/javascript';
      scriptElement.onload = () => {
        resolve();
      };
      scriptElement.onerror = (event: Event | string) => {
        reject(event);
      };
      document.head.appendChild(scriptElement);
    });
  }

  fetchAnnualRevenues(): void {
    this.paymentConnection.getAnnualRevenues().subscribe(
      (data: AnnualRevenue[]) => {
        this.annualRevenues = data;
        this.plotData();
      },
      (error) => {
        console.error('Error fetching annual revenues:', error);
      }
    );
  }
  plotData(): void {
    const companyYearRevenueMap = new Map<string, Map<number, number>>();
    const companyColors: Map<string, string> = new Map();

    // Function to generate a distinct color in HSL format ensuring colors are far apart
    function generateDistinctColors(count: number): string[] {
        const colors = [];
        const hueStep = 360 / count; // Divide the color wheel into equal parts
        for (let i = 0; i < count; i++) {
            const hue = i * hueStep;
            const color = `hsl(${hue}, 70%, 50%)`; // Fixed saturation and lightness
            colors.push(color);
        }
        return colors;
    }

    // Generate distinct colors for each company
    const companies = Array.from(new Set(this.annualRevenues.map(item => item.licensor)));
    const colors = generateDistinctColors(companies.length);
    companies.forEach((company, index) => {
        companyColors.set(company, colors[index]);
    });

    // Group data by company and then by year
    this.annualRevenues.forEach(item => {
        const year = item.year;
        const company = item.licensor;
        const licensing_revenue = item.licensingRevenue;

        if (!companyYearRevenueMap.has(company)) {
            companyYearRevenueMap.set(company, new Map());
        }
        companyYearRevenueMap.get(company)!.set(year, licensing_revenue);
    });

    const traces: Partial<Plotly.PlotData>[] = [];

    // Get unique years
    const uniqueYears = Array.from(new Set(this.annualRevenues.map(item => item.year)));

    // Calculate total revenue for each company
    const companyTotalRevenues = new Map<string, number>();
    companyYearRevenueMap.forEach((yearRevenueMap, company) => {
        let totalRevenue = 0;
        yearRevenueMap.forEach(revenue => {
            totalRevenue += revenue;
        });
        companyTotalRevenues.set(company, totalRevenue);
    });

    // Sort companies by total revenue (high to low)
    const sortedCompanies = Array.from(companyTotalRevenues.entries())
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

    // Create a trace for each company in sorted order
    sortedCompanies.forEach(company => {
        const yearRevenueMap = companyYearRevenueMap.get(company)!;
        const years: number[] = [];
        const revenues: number[] = [];

        yearRevenueMap.forEach((revenue, year) => {
            years.push(year);
            revenues.push(revenue);
        });

        const trace: Partial<Plotly.PlotData> = {
            x: years,
            y: revenues,
            type: 'bar',
            name: company,
            marker: { color: companyColors.get(company) ?? '#000000' }, // Use default color if undefined
            hovertemplate: years.map((year, i) => `Year: ${year}, Licensing Revenue: ${revenues[i]}`), // Custom hover text
            hoverinfo: 'text', // Only show hover text
        };
        traces.push(trace);
    });

    const chartHeight = 100 + uniqueYears.length * 80;  // Adjust base height and multiplier as needed

    const layout = {
        height: chartHeight,
        autosize: true,
        title: 'Licensing Revenues by Year',
        xaxis: { title: 'Year' },
        yaxis: {
            title: 'Licensing Revenue (in thousands)',
            tickformat: ',d',
            type: 'linear',
            rangemode: 'tozero',
            automargin: true, // Ensure margins are adjusted automatically
        },
        barmode: 'stack', // Display bars stacked
    };

    Plotly.newPlot('myDiv', traces, layout);
}

  

  generateRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
