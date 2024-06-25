import { Component, OnInit } from '@angular/core';
import { SalesService } from '../sales-service.service';
declare var Plotly: any;

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html'
})
export class SalesComponent implements OnInit {

  salesList: any[] = [];

  constructor(private salesService: SalesService) { }

  ngOnInit(): void {
    this.loadSales();

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
  loadSales(): void {
    this.salesService.getAllSales().subscribe(
      data => {
        this.salesList = data;
      },
      error => {
        console.error('Error fetching sales data: ', error);
      }
    );
  }


  plotData(): void {
    // Assuming 'salesList' is the array containing sales information
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
