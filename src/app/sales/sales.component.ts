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
    const dataCopy = [...this.salesList]; // Replace 'this.salesList' with your actual sales data array
    
    // Create a map to store sales data by company, year, and quarter
    const companyYearQuarterSalesMap = new Map<string, Map<string, number>>();
  
    // Populate the map with data
    dataCopy.forEach(item => {
      if (item.company && item.years && item.quarters && item.sales) {
        let yearQuarterSalesMap = companyYearQuarterSalesMap.get(item.company);
        if (!yearQuarterSalesMap) {
          yearQuarterSalesMap = new Map<string, number>();
          companyYearQuarterSalesMap.set(item.company, yearQuarterSalesMap);
        }
        const key = `${item.years}-${item.quarters}`;
        const salesData = yearQuarterSalesMap.get(key) || 0;
        yearQuarterSalesMap.set(key, salesData + item.sales);
      }
    });
  
    // Generate traces for each company
    const traces: Partial<Plotly.PlotData>[] = [];
    companyYearQuarterSalesMap.forEach((yearQuarterSalesMap, company) => {
      let xValues: string[] = [];
      let yValues: number[] = [];
      yearQuarterSalesMap.forEach((sales, yearQuarter) => {
        const [year, quarter] = yearQuarter.split('-');
        xValues.push(`${year} ${quarter}`);
        yValues.push(sales);
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
        text: yValues.map((sales, index) => `Company: ${company}, Year: ${xValues[index].split(' ')[0]}, Quarter: ${xValues[index].split(' ')[1]}, Sales Amount: ${sales}`),
        hoverinfo: 'text',
      });
    });
  
    // Configure layout
    const layout: Partial<Plotly.Layout> = {
      height: 600,
      autosize: true,
      title: 'Sales Amount Over Quarters',
      xaxis: { title: 'Year and Quarter' },
      yaxis: {
        title: 'Sales Amount',
        tickformat: ',d',
        type: 'linear',
        rangemode: 'tozero',
        range: [0, Math.ceil(Math.max(...traces.flatMap(trace => trace.y as number[])))],
      },
      legend: {
        traceorder: 'reversed', // Reverse the order of legend items for better interactivity
      },
    };
  
    // Plot with Plotly
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
