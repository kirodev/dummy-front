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
  isLoading: boolean = true;

  isPopupVisible = false;
  popupText = '';
  activeTab = 'sales'; // Default active tab
  private plotRendered = false;
  private comparisonPlotRendered = false;
  currentPlotType: 'bar' | 'line' = 'bar';

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
  togglePlotType(): void {
    this.currentPlotType = this.currentPlotType === 'bar' ? 'line' : 'bar';
    this.plotRendered = false; // Reset the render flag
    this.plotData(); // Re-render the chart
  }

  plotData(): void {
    if (!this.tabletSalesList || this.tabletSalesList.length === 0) {
      console.error('No sales data available');
      return;
    }

    const tabletSalesMap = new Map<
      string,
      {
        company: string;
        yearQuarter: string;
        year: number;
        averageSales: number;
        individualSales: { source: string; link: string; sales: number }[];
      }
    >();

    // Aggregate data by company, year, and quarter
    this.tabletSalesList.forEach((item) => {
      const year = Number(item.year?.toString().trim());
      const quarter = this.getQuarterValue(item.quarter?.toString().trim());

      if (isNaN(year) || isNaN(quarter) || year < 2010 || year > 2024) {
        console.warn(`Skipping invalid or out-of-range year/quarter: ${item.year}, ${item.quarter}`);
        return;
      }

      const yearQuarterKey = `${year} Q${quarter}`;
      let data = tabletSalesMap.get(`${item.company}|${yearQuarterKey}`);

      if (!data) {
        data = {
          company: item.company,
          yearQuarter: yearQuarterKey,
          year: year,
          averageSales: item.average_sales,
          individualSales: [],
        };
        tabletSalesMap.set(`${item.company}|${yearQuarterKey}`, data);
      }

      data.individualSales.push({ source: item.source, link: item.link, sales: item.sales });
    });

    // Create traces for each company
    const companyMap = new Map<string, { x: string[]; y: number[]; customdata: any[] }>();

    const allYearQuarterSet = new Set<string>();

    tabletSalesMap.forEach((data, key) => {
      if (data.averageSales > 0) {
        const [company, yearQuarter] = key.split('|');
        allYearQuarterSet.add(yearQuarter);
        if (!companyMap.has(company)) {
          companyMap.set(company, { x: [], y: [], customdata: [] });
        }
        companyMap.get(company)?.x.push(yearQuarter);
        companyMap.get(company)?.y.push(data.averageSales);
        companyMap.get(company)?.customdata.push(data);
      }
    });

    // Correctly sort by year and quarter
    const sortedYearQuarters = Array.from(allYearQuarterSet)
      .map((yearQuarter) => {
        const [year, quarter] = yearQuarter.split(' Q');
        return { year: Number(year), quarter: Number(quarter), yearQuarter };
      })
      .sort((a, b) => a.year - b.year || a.quarter - b.quarter)
      .map((item) => item.yearQuarter);

    // Ensure each company's x and y values are ordered correctly
    companyMap.forEach((values) => {
      const sortedIndices = values.x
        .map((yearQuarter, index) => ({
          yearQuarter,
          index,
        }))
        .sort((a, b) => sortedYearQuarters.indexOf(a.yearQuarter) - sortedYearQuarters.indexOf(b.yearQuarter))
        .map((item) => item.index);

      // Reorder arrays
      values.x = sortedIndices.map((i) => values.x[i]);
      values.y = sortedIndices.map((i) => values.y[i]);
      values.customdata = sortedIndices.map((i) => values.customdata[i]);
    });

    // Create traces for Plotly
    const traces: Partial<Plotly.PlotData>[] = [];
    companyMap.forEach((values, company) => {
      traces.push({
        x: values.x,
        y: values.y,
        type: this.currentPlotType as Plotly.PlotType, // Dynamic type based on the selected chart type
        mode: this.currentPlotType === 'line' ? 'lines+markers' : undefined, // Show markers in line charts
        name: company,
        customdata: values.customdata,
        hovertemplate: `${company}<br>Average Sales: %{y}<extra></extra>`,
        marker: { color: this.generateRandomColor(), size: this.currentPlotType === 'line' ? 8 : undefined }, // Adjust marker size
        line: { width: this.currentPlotType === 'line' ? 2 : undefined }, // Line width for visibility
      });
    });

    const layout: Partial<Plotly.Layout> = {
      title: this.currentPlotType === 'bar'
        ? 'Average Tablet Sales by Year and Quarter (Stacked by Company)'
        : 'Average Tablet Sales Trend by Year and Quarter',
      barmode: 'stack', // Only applies when type is 'bar'
      xaxis: {
        title: 'Year and Quarter',
        tickangle: -45,
        categoryorder: 'array', // Explicitly set the order
        categoryarray: sortedYearQuarters, // Provide the correct order
      },
      yaxis: { title: 'Average Sales' },
      height: 600,
    };

    // Render the plot
    const tabletSalesDiv = document.getElementById('tabletSalesDiv') as any;
    if (tabletSalesDiv) {
      Plotly.newPlot('tabletSalesDiv', traces, layout).then(() => {
        this.isLoading = false;
        tabletSalesDiv.on('plotly_click', (data: any) => this.handlePointClick(data));
      });
    }
  }



  private getQuarterValue(quarter: string): number {
    return Number(quarter.replace('Q', ''));
  }


 generateRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  handlePointClick(data: any): void {
    const point = data.points[0];
    const customData = point.customdata;

    let popupContent = `<strong>Company:</strong> ${customData.company}<br>`;
    popupContent += `<strong>Year and Quarter:</strong> ${customData.yearQuarter}<br>`;
    popupContent += `<strong>Average Sales:</strong> ${customData.averageSales.toLocaleString()}<br>`;

    // Calculate the total sales and show individual sales details
    let totalSales = 0;
    const salesDetails = customData.individualSales.map((salesEntry: any) => {
      totalSales += salesEntry.sales;

      const displayedLink = this.extractDomain(salesEntry.link);
      return `
        <strong>Source:</strong> ${salesEntry.source} <br>
        <strong>Sales:</strong> ${salesEntry.sales.toLocaleString()} <br>
        ${salesEntry.link ? `<strong>Link:</strong> <a href="${salesEntry.link}" target="_blank">${displayedLink}</a><hr>` : ''}
      `;
    });

    const averageCalculated = (totalSales / customData.individualSales.length).toLocaleString();

    popupContent += `<hr><strong>How Average was Calculated:</strong><br>`;
    popupContent += `Sum of Sales: ${totalSales.toLocaleString()}<br>`;
    popupContent += `Number of Entries: ${customData.individualSales.length}<br>`;
    popupContent += `Calculated Average: ${averageCalculated}<br><br>`;

    popupContent += `<hr><strong>Individual Sales Details:</strong><br>${salesDetails.join('<br>')}`;

    this.showPopup(popupContent);
  }


  extractDomain(url: string): string {
    try {
      const domain = new URL(url).hostname;
      const parts = domain.split('.');
      if (parts.length >= 2) {
        return parts[parts.length - 2]; // Return the main domain (e.g., `canalys` or `idc`)
      }
      return domain;
    } catch (e) {
      console.error('Invalid URL:', url);
      return 'Invalid URL';
    }
  }

  showPopup(infoText: string): void {
    this.popupText = infoText;
    this.isPopupVisible = true;
  }

  hidePopup(): void {
    this.isPopupVisible = false;
  }
}
