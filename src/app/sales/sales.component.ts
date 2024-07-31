import { Component, OnInit } from '@angular/core';
import { SalesService } from '../sales-service.service';
declare var Plotly: any;


@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit {

  salesList: any[] = [];
  private plotlyLoaded = false;
  private dataLoaded = false;

  isPopupVisible = false;
  popupText = '';

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

    const myDiv: any = document.getElementById('myDiv');
    if (!myDiv) {
      console.error('Target div for Plotly graph not found');
      return;
    }

    const salesMap = new Map<string, { sales: number, source: { source: string, sales: number, used: string, discarded: string, link: string }[] }>();

    this.salesList.forEach(item => {
      if (item.company && item.years && item.quarters && item.sales) {
        const key = `${item.company}|${item.years}|${item.quarters}`;
        let data = salesMap.get(key);
        if (!data) {
          data = { sales: 0, source: [] };
          salesMap.set(key, data);
        }
        data.sales = item.sales;
        data.source.push({
          source: item.source,
          sales: item.source_sales,
          used: item.used,
          discarded: item.discarded,
          link: item.link
        });
      }
    });

    const allXValues = Array.from(salesMap.keys())
      .map(key => {
        const [, year, quarter] = key.split('|');
        return `${year} ${quarter}`;
      })
      .sort();

    const uniqueXValues = [...new Set(allXValues)];

    const traces: Partial<Plotly.PlotData>[] = [];
    const companies = new Set(this.salesList.map(item => item.company));

    companies.forEach(company => {
      let xValues: string[] = [];
      let yValues: (number | null)[] = [];
      let customData: any[] = [];

      uniqueXValues.forEach(xValue => {
        const [year, quarter] = xValue.split(' ');
        const key = `${company}|${year}|${quarter}`;
        const data = salesMap.get(key);

        if (data) {
          xValues.push(xValue);
          yValues.push(data.sales);
          customData.push({
            company,
            year,
            quarter,
            sales: data.sales,
            source: data.source
          });
        } else {
          xValues.push(xValue);
          yValues.push(null); // Ensure to have data for every xValue
          customData.push({
            company,
            year,
            quarter,
            sales: null,
            source: []
          });
        }
      });

      traces.push({
        x: xValues,
        y: yValues,
        mode: 'lines+markers',
        type: 'scatter',
        name: company,
        line: { width: 2 },
        marker: { color: this.generateRandomColor() },
        customdata: customData,
        connectgaps: true
      });
    });

    const layout: Partial<Plotly.Layout> = {
      height: 600,
      autosize: true,
      title: 'Volume Of Smartphone Sales Over Quarters by Company',
      xaxis: {
        title: 'Year and Quarter',
        tickangle: -45,
        tickmode: 'array',
        tickvals: uniqueXValues,
        ticktext: uniqueXValues
      },
      yaxis: {
        title: 'Sales Amount',
        tickformat: ',d',
        type: 'linear',
        rangemode: 'tozero',
        range: [0, Math.ceil(Math.max(...traces.flatMap(trace => trace.y as number[])))],
      },
      legend: {
        traceorder: 'reversed',
      }
    };

    // Wait for Plotly to be loaded
    const interval = setInterval(() => {
      if (window['Plotly']) {
        clearInterval(interval);
        Plotly.newPlot('myDiv', traces, layout).then(() => {
          console.log('Graph plotted successfully');
          myDiv.on('plotly_click', (data: any) => {
            this.handlePointClick(data);
          });
        }).catch((error: any) => {
          console.error('Error plotting graph:', error);
        });
      }
    }, 100);
  }

handlePointClick(data: any): void {
    const point = data.points[0];
    const customData = point.customdata;

    let infoText = `<strong>Company:</strong> ${customData.company}<br>`;
    infoText += `<strong>Year:</strong> ${customData.year}<br>`;
    infoText += `<strong>Quarter:</strong> ${customData.quarter}<br>`;
    infoText += `<strong>Sales:</strong> ${customData.sales ? customData.sales.toFixed(2) : 'N/A'}<br><br>`;

    infoText += '<strong>Source:</strong><br>';
    customData.source.forEach((source: any) => {
        if (source.source !== source.discarded) {
            infoText += `${source.source}: ${source.sales} (<a href="${source.link}" target="_blank">Link</a>)<br>`;
        }
    });

    const usedSet = new Set<string>();
    customData.source.forEach((source: any) => {
        if (source.used && source.used.trim() !== '') {
            usedSet.add(`${source.used} (<a href="${source.link}" target="_blank">Link</a>)`);
        }
    });
    if (usedSet.size > 0) {
        infoText += '<br><strong>Used:</strong><br>';
        usedSet.forEach(item => {
            infoText += `${item}<br>`;
        });
    }

    const discardedSet = new Set<string>();
    customData.source.forEach((source: any) => {
        if (source.source === source.discarded) {
            discardedSet.add(`${source.source}: ${source.sales} (<a href="${source.link}" target="_blank">Link</a>)`);
        }
    });
    if (discardedSet.size > 0) {
        infoText += '<br><strong>Discarded:</strong><br>';
        discardedSet.forEach(item => {
            infoText += `${item}<br>`;
        });
    }

    this.showPopup(infoText);
}



  showPopup(infoText: string): void {
    this.popupText = infoText;
    this.isPopupVisible = true;
  }

  hidePopup(): void {
    this.isPopupVisible = false;
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
