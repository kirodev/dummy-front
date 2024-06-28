import { Component, OnInit } from '@angular/core';
import { SalesService } from '../sales-service.service';
declare var Plotly: any;

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html'
})
export class SalesComponent implements OnInit {

  salesList: any[] = [];
  private plotlyLoaded = false;
  private dataLoaded = false;

  constructor(private salesService: SalesService) { }

  ngOnInit(): void {
    this.loadSales();
    this.loadPlotlyScript();
  }

  loadPlotlyScript(): void {
    const scriptElement = document.createElement('script');
    scriptElement.src = 'https://cdn.plot.ly/plotly-2.25.2.min.js';
    scriptElement.type = 'text/javascript';
    scriptElement.onload = () => {
      console.log('Plotly.js script loaded successfully');
      this.plotlyLoaded = true;
      this.tryPlotData();
    };
    scriptElement.onerror = (event: Event | string) => {
      console.error('Error loading Plotly.js script:', event);
    };
    document.head.appendChild(scriptElement);
  }

  loadSales(): void {
    this.salesService.getAllSales().subscribe(
      data => {
        this.salesList = data;
        this.dataLoaded = true;
        this.tryPlotData();
      },
      error => {
        console.error('Error fetching sales data: ', error);
      }
    );
  }

  tryPlotData(): void {
    if (this.plotlyLoaded && this.dataLoaded) {
      this.plotData();
    }
  }

  plotData(): void {
    if (!this.salesList || this.salesList.length === 0) {
      console.error('No sales data available');
      return;
    }
  
    const myDiv = document.getElementById('myDiv');
    if (!myDiv) {
      console.error('Target div for Plotly graph not found');
      return;
    }
  
    // Create a map to store sales data by company, year, and quarter
    const salesMap = new Map<string, { total: number, count: number, sources: { source: string, sales: number }[] }>();
  
    // Populate the map with data
    this.salesList.forEach(item => {
      if (item.company && item.years && item.quarters && item.sales) {
        const key = `${item.company}|${item.years}|${item.quarters}`;
        let data = salesMap.get(key);
        if (!data) {
          data = { total: 0, count: 0, sources: [] };
          salesMap.set(key, data);
        }
        data.total += item.sales;
        data.count += 1;
        data.sources.push({ source: item.sources, sales: item.sales });
      }
    });
  
    // Generate traces for each company
    const traces: Partial<Plotly.PlotData>[] = [];
    const companies = new Set(this.salesList.map(item => item.company));
  
    companies.forEach(company => {
      let xValues: string[] = [];
      let yValues: number[] = [];
      let hoverTexts: string[] = [];
  
      // Sort the keys to ensure chronological order
      const companyData = Array.from(salesMap.entries())
        .filter(([key]) => key.startsWith(`${company}|`))
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
  
      companyData.forEach(([key, data]) => {
        const [, year, quarter] = key.split('|');
        const avgSales = data.total / data.count;
        xValues.push(`${year} ${quarter}`);
        yValues.push(avgSales);
  
        let hoverText = `Company: ${company}<br>Year: ${year}<br>Quarter: ${quarter}<br>Average Sales: ${avgSales.toFixed(2)}<br><br>Sources:`;
        data.sources.forEach(source => {
          hoverText += `<br>${source.source}: ${source.sales}`;
        });
        hoverTexts.push(hoverText);
      });
  
      traces.push({
        x: xValues,
        y: yValues,
        mode: 'lines+markers',
        type: 'scatter',
        name: company,
        line: { width: 2 },
        marker: {
          color: this.generateRandomColor()
        },
        text: hoverTexts,
        hoverinfo: 'text',
      });
    });
  
    // Configure layout
    const layout: Partial<Plotly.Layout> = {
      height: 600,
      autosize: true,
      title: 'Volume Of Smartphone Sales Over Quarters by Company',
      xaxis: { title: 'Year and Quarter' },
      yaxis: {
        title: 'Average Sales Amount',
        tickformat: ',d',
        type: 'linear',
        rangemode: 'tozero',
        range: [0, Math.ceil(Math.max(...traces.flatMap(trace => trace.y as number[])))],
      },
      legend: {
        traceorder: 'reversed',
      },
      hovermode: 'closest',
    };
  
    // Plot with Plotly
    Plotly.newPlot('myDiv', traces, layout).then(() => {
      console.log('Graph plotted successfully');
    }).catch((error: any) => {
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
