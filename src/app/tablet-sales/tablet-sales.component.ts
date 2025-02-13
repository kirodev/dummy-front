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
    // 1) Purge any existing plot so we start fresh
    Plotly.purge('tabletSalesDiv');

    // 2) Check if there's any data at all
    if (!this.tabletSalesList || this.tabletSalesList.length === 0) {
      console.error('No sales data available');
      return;
    }

    // 3) Filter out items with an empty or blank company name
    const filteredList = this.tabletSalesList.filter(
      (item) => item.company && item.company.trim()
    );
    if (filteredList.length === 0) {
      console.warn('No valid companies after filtering out empty names');
      return;
    }

    // STEP 1: Build a company map and collect all year–quarter labels.
    const companyMap = new Map<string, { x: string[]; y: number[]; customdata: any[] }>();
    const allYearQuarterSet = new Set<string>();

    filteredList.forEach((item) => {
      const year = Number(item.year?.toString().trim());
      const quarter = this.getQuarterValue(item.quarter?.toString().trim());
      if (isNaN(year) || isNaN(quarter) || year < 2010 || year > 2024) {
        console.warn(`Skipping invalid or out-of-range year/quarter: ${item.year}, ${item.quarter}`);
        return;
      }
      const yearQuarter = `${year} Q${quarter}`;
      allYearQuarterSet.add(yearQuarter);

      if (!companyMap.has(item.company)) {
        companyMap.set(item.company, { x: [], y: [], customdata: [] });
      }
      const compData = companyMap.get(item.company)!;
      compData.x.push(yearQuarter);
      compData.y.push(item.average_sales);
      compData.customdata.push({
        ...item,
        yearQuarter,
        averageSales: item.average_sales,
        individualSales: item.individual_sales
      });
    });

    // STEP 2: Create a sorted array of year–quarter labels.
    const sortedYearQuarters = Array.from(allYearQuarterSet)
      .map((yq) => {
        const [year, quarter] = yq.split(' Q');
        return { year: Number(year), quarter: Number(quarter), yq };
      })
      .sort((a, b) => a.year - b.year || a.quarter - b.quarter)
      .map((item) => item.yq);

    // STEP 3: Align each company’s data to the full sorted list of quarters.
    companyMap.forEach((data) => {
      const alignedY = sortedYearQuarters.map((q) => {
        const idx = data.x.indexOf(q);
        return idx !== -1 ? data.y[idx] : 0;
      });
      data.x = [...sortedYearQuarters];
      data.y = alignedY;
    });

    // STEP 4: Sort companies by total sales.
    const sortedCompanies = Array.from(companyMap.keys()).sort((a, b) => {
      const sumA = companyMap.get(a)!.y.reduce((acc, v) => acc + v, 0);
      const sumB = companyMap.get(b)!.y.reduce((acc, v) => acc + v, 0);
      return sumB - sumA;
    });

    // STEP 5: Build individual traces for ALL companies.
    const traces: Partial<Plotly.PlotData>[] = [];
    sortedCompanies.forEach((company) => {
      const data = companyMap.get(company)!;
      traces.push({
        x: data.x,
        y: data.y,
        type: this.currentPlotType as Plotly.PlotType,
        mode: this.currentPlotType === 'line' ? 'lines+markers' : undefined,
        name: company,
        customdata: data.customdata,
        hovertemplate: `${company}<br>Average Sales: %{y}<extra></extra>`,
        marker: {
          color: this.generateRandomColor(),
          size: this.currentPlotType === 'line' ? 8 : undefined,
        },
        line: { width: this.currentPlotType === 'line' ? 2 : undefined },
      });
    });

    // STEP 6: Add an "Others" trace that sums sales of hidden companies.
    // Initially, no companies are hidden so aggregated values are all zero.
    const initialOthers = sortedYearQuarters.map(() => 0);
    traces.push({
      x: sortedYearQuarters,
      y: initialOthers,
      type: this.currentPlotType as Plotly.PlotType,
      mode: this.currentPlotType === 'line' ? 'lines+markers' : undefined,
      name: 'Others',
      hovertemplate: `Others<br>Hidden Sales: %{y}<extra></extra>`,
      marker: { color: '#D3D3D3', size: this.currentPlotType === 'line' ? 8 : undefined },
      line: { width: this.currentPlotType === 'line' ? 2 : undefined },
      showlegend: false,  // initially not in the legend
      visible: false      // initially hidden
    });

    // STEP 7: Define the layout.
    const layout: Partial<Plotly.Layout> = {
      title: this.currentPlotType === 'bar'
        ? 'Average Tablet Sales by Year and Quarter'
        : 'Average Tablet Sales Trend by Year and Quarter',
      barmode: 'stack',
      xaxis: {
        title: 'Year and Quarter',
        tickangle: -45,
        categoryorder: 'array',
        categoryarray: sortedYearQuarters,
      },
      yaxis: { title: 'Average Sales' },
      height: 600,
    };

    // STEP 8: Render the plot.
    const tabletSalesDiv = document.getElementById('tabletSalesDiv') as any;
    if (!tabletSalesDiv) {
      console.error('Target div for Plotly not found');
      return;
    }

    // Log your final traces to see exactly what's being passed:
    console.log('Final traces:', traces);

    Plotly.newPlot('tabletSalesDiv', traces, layout).then(() => {
      this.isLoading = false;
      tabletSalesDiv.on('plotly_click', (data: any) => this.handlePointClick(data));

      // STEP 9: Dynamically recalculate the "Others" trace based on hidden companies.
      let isUpdatingOthers = false;
      tabletSalesDiv.on('plotly_restyle', () => {
        if (isUpdatingOthers) return;
        isUpdatingOthers = true;

        const currentData: any[] = tabletSalesDiv.data;
        const othersIndex = currentData.length - 1;
        const updatedOthers = sortedYearQuarters.map((_, idx) => {
          let sum = 0;
          // Loop through all company traces (exclude the last trace which is Others).
          for (let i = 0; i < currentData.length - 1; i++) {
            if (currentData[i].visible === 'legendonly') {
              sum += currentData[i].y[idx];
            }
          }
          return sum;
        });

        const maxOthers = Math.max(...updatedOthers);
        // If maxOthers is greater than 0, we want Others to show.
        const newVisible = maxOthers > 0;
        const newShowLegend = maxOthers > 0;
        const newName = maxOthers > 0 ? 'Others' : '';

        // Use Plotly.update to update multiple trace properties, including the name.
        Plotly.update(
          'tabletSalesDiv',
          {
            y: [updatedOthers],
            visible: [newVisible],
            showlegend: [newShowLegend],
            name: [newName]
          },
          {},
          [othersIndex]
        )
        .then(() => { isUpdatingOthers = false; })
        .catch(() => { isUpdatingOthers = false; });
      });
    });
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
