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
      scriptElement.onload = () => resolve();
      scriptElement.onerror = (event: Event | string) => reject(event);
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

    function generateDistinctColors(count: number): string[] {
        const colors = [];
        const hueStep = 360 / count;
        for (let i = 0; i < count; i++) {
            const hue = i * hueStep;
            const color = `hsl(${hue}, 70%, 50%)`;
            colors.push(color);
        }
        return colors;
    }

    // Filter out Samsung Electronics Co., Ltd. data
    const filteredRevenues = this.annualRevenues.filter(item => item.licensor !== 'Samsung Electronics Co., Ltd.');

    const companies = Array.from(new Set(filteredRevenues.map(item => item.licensor)));
    const colors = generateDistinctColors(companies.length);
    companies.forEach((company, index) => {
        companyColors.set(company, colors[index]);
    });

    filteredRevenues.forEach(item => {
        const year = item.year;
        const company = item.licensor;
        const licensing_revenue = item.licensingRevenue;

        if (!companyYearRevenueMap.has(company)) {
            companyYearRevenueMap.set(company, new Map());
        }
        companyYearRevenueMap.get(company)!.set(year, licensing_revenue);
    });

    const traces: Partial<Plotly.PlotData>[] = [];
    const uniqueYears = Array.from(new Set(filteredRevenues.map(item => item.year)))
                            .filter(year => year !== null && year !== undefined && year !== 0) // Remove nulls and 0
                            .sort((a, b) => a - b);

    console.log('Unique Years:', uniqueYears);

    const companyTotalRevenues = new Map<string, number>();
    companyYearRevenueMap.forEach((yearRevenueMap, company) => {
        let totalRevenue = 0;
        yearRevenueMap.forEach(revenue => {
            totalRevenue += revenue;
        });
        companyTotalRevenues.set(company, totalRevenue);
    });

    const sortedCompanies = Array.from(companyTotalRevenues.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    console.log('Sorted Companies:', sortedCompanies);

    sortedCompanies.forEach(company => {
        const yearRevenueMap = companyYearRevenueMap.get(company)!;
        const years: number[] = [];
        const revenues: number[] = [];

        uniqueYears.forEach(year => {
            years.push(year);
            revenues.push(yearRevenueMap.get(year) ?? 0); // Default to 0 if no revenue data
        });

        console.log('Company:', company);
        console.log('Years:', years);
        console.log('Revenues:', revenues);

        const trace: Partial<Plotly.PlotData> = {
            x: years,
            y: revenues,
            type: 'bar',
            name: company,
            marker: { color: companyColors.get(company) ?? '#000000' },
            hovertemplate: years.map((year, i) => `Year: ${year}, Licensing Revenue: ${revenues[i]}`),
            hoverinfo: 'text',
        };
        traces.push(trace);
    });

    const chartHeight = 100 + uniqueYears.length * 50;

    const layout: Partial<Plotly.Layout> = {
        height: chartHeight,
        autosize: true,
        title: 'Licensing Revenues by Year',
        xaxis: {
            title: 'Year',
            tickvals: uniqueYears,
            ticktext: uniqueYears.map(year => year.toString()), // Ensure ticktext is not null
            type: 'category',
        },
        yaxis: {
            title: 'Licensing Revenue (in thousands)',
            tickformat: ',d',
            type: 'linear',
            rangemode: 'tozero', // Ensure y-axis starts at 0
            automargin: true,
        },
        barmode: 'stack',
    };

    Plotly.newPlot('myDiv', traces, layout).catch((error: any) => {
        console.error('Error plotting graph:', error);
    });
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
