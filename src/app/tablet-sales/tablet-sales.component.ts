import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { SalesService } from './../sales-service.service'; // Replace with your service
declare var Plotly: any;

@Component({
  selector: 'app-tablet-sales',
  templateUrl: './tablet-sales.component.html',
  styleUrls: ['./tablet-sales.component.css'],
})
export class TabletSalesComponent implements OnInit, AfterViewChecked {
  tabletSalesList: any[] = [];
  private plotlyLoaded = false;
  private dataLoaded = false;

  isPopupVisible = false;
  popupText = '';
  activeTab = 'sales'; // Default active tab
  private plotRendered = false;
  private comparisonPlotRendered = false;

  constructor(private salesService: SalesService) {}

  ngOnInit(): void {
    this.loadTabletSales();
    this.loadPlotlyScript();
  }

  ngAfterViewChecked(): void {
    if (this.plotlyLoaded && this.dataLoaded) {
      if (this.activeTab === 'sales' && !this.plotRendered) {
        this.plotData();
        this.plotRendered = true;
        this.comparisonPlotRendered = false;
      } else if (this.activeTab === 'comparison' && !this.comparisonPlotRendered) {
        this.comparisonPlotRendered = true;
        this.plotRendered = false;
      }
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.plotRendered = false;
    this.comparisonPlotRendered = false;
  }

  loadPlotlyScript(): void {
    const scriptElement = document.createElement('script');
    scriptElement.src = 'https://cdn.plot.ly/plotly-2.25.2.min.js';
    scriptElement.type = 'text/javascript';
    scriptElement.onload = () => {
      this.plotlyLoaded = true;
      this.tryPlotData();
    };
    document.head.appendChild(scriptElement);
  }

  loadTabletSales(): void {
    this.salesService.getAllTabletSales().subscribe(
      (data) => {
        this.tabletSalesList = data;
        this.dataLoaded = true;
        this.tryPlotData();
      },
      (error) => {
        console.error('Error fetching tablet sales data:', error);
      }
    );
  }

  tryPlotData(): void {
    if (this.plotlyLoaded && this.dataLoaded) {
      this.plotData();
    }
  }

  plotData(): void {
    if (!this.tabletSalesList || this.tabletSalesList.length === 0) {
      console.error('No sales data available');
      return;
    }

    const tabletSalesMap = new Map<
      string,
      {
        totalSales: number;
        averageSales: number;
        sources: { source: string; link: string; sales: number }[];
      }
    >();

    // Group sales data by company, year, and quarter
    this.tabletSalesList.forEach((item) => {
      const key = `${item.company}|${item.year}|${item.quarter}`;
      let data = tabletSalesMap.get(key);

      if (!data) {
        data = {
          totalSales: 0,
          averageSales: item.average_sales,
          sources: [],
        };
        tabletSalesMap.set(key, data);
      }

      data.totalSales += item.sales;
      data.sources.push({ source: item.source, link: item.link, sales: item.sales });
    });

    // Prepare data for plotting
    const xValues = Array.from(tabletSalesMap.keys()).map((key) => key.split('|').slice(1).join(' '));
    const ySales = Array.from(tabletSalesMap.values()).map((data) => data.totalSales);
    const yAverages = Array.from(tabletSalesMap.values()).map((data) => data.averageSales);

    // Create traces
    const salesTrace = {
      x: xValues,
      y: ySales,
      type: 'bar',
      name: 'Total Sales',
      customdata: Array.from(tabletSalesMap.values()),
      hovertemplate: 'Total Sales: %{y}<extra></extra>',
    };

    const avgTrace = {
      x: xValues,
      y: yAverages,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Average Sales',
      line: { color: 'orange', dash: 'dashdot' },
      hovertemplate: 'Average Sales: %{y}<extra></extra>',
    };

    const layout = {
      title: 'Tablet Sales and Averages Over Time',
      xaxis: { title: 'Year and Quarter' },
      yaxis: { title: 'Sales' },
      height: 600,
      barmode: 'group',
    };

    // Plot the graph
    const tabletSalesDiv = document.getElementById('tabletSalesDiv') as any;
    if (tabletSalesDiv) {
      Plotly.newPlot('tabletSalesDiv', [salesTrace, avgTrace], layout).then(() => {
        (tabletSalesDiv as any).on('plotly_click', (data: any) => this.handlePointClick(data));
      });
    }
  }


  handlePointClick(data: any): void {
    const point = data.points[0];
    const customData = point.customdata;

    // Display sources used for the selected point
    let infoText = `<strong>Company:</strong> ${customData.company}<br>`;
    infoText += `<strong>Year:</strong> ${customData.year}<br>`;
    infoText += `<strong>Quarter:</strong> ${customData.quarter}<br>`;
    infoText += `<strong>Total Sales:</strong> ${customData.totalSales}<br>`;
    infoText += `<strong>Average Sales:</strong> ${customData.averageSales}<br>`;
    infoText += `<strong>Sources:</strong><ul>`;

    customData.sources.forEach((source: any) => {
      infoText += `<li>${source.source} - <a href="${source.link}" target="_blank">${source.link}</a> (Sales: ${source.sales})</li>`;
    });

    infoText += '</ul>';

    this.showPopup(infoText);
  }

  showPopup(infoText: string): void {
    this.popupText = infoText;
    this.isPopupVisible = true;
  }

  hidePopup(): void {
    this.isPopupVisible = false;
  }
}
