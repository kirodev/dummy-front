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

    // STEP 1: Build a company map and collect all year–quarter labels.
    const companyMap = new Map<string, { x: string[]; y: number[]; customdata: any[] }>();
    const allYearQuarterSet = new Set<string>();

    this.tabletSalesList.forEach((item) => {
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
      compData.customdata.push(item);
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
      data.x = sortedYearQuarters.slice();
      data.y = alignedY;
    });

    // STEP 4: Sort companies by their total sales and split into top and others.
    const sortedCompanies = Array.from(companyMap.keys()).sort((a, b) => {
      const sumA = companyMap.get(a)!.y.reduce((acc, v) => acc + v, 0);
      const sumB = companyMap.get(b)!.y.reduce((acc, v) => acc + v, 0);
      return sumB - sumA;
    });
    const TOP_N = 5; // Adjust the number of top companies as needed.
    const topCompanies = sortedCompanies.slice(0, TOP_N);
    const otherCompanies = sortedCompanies.slice(TOP_N);

    // STEP 5: Build traces for the top companies.
    // Also store each top company’s y-data for dynamic recalculation.
    const traces: Partial<Plotly.PlotData>[] = [];
    const topCompanyYs: number[][] = [];

    topCompanies.forEach((company) => {
      const data = companyMap.get(company)!;
      topCompanyYs.push(data.y.slice()); // Copy y-values.
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

    // STEP 6: Compute the static "Others" values from companies not in the top group.
    const othersStatic = sortedYearQuarters.map((_, idx) => {
      let sum = 0;
      otherCompanies.forEach((company) => {
        const data = companyMap.get(company)!;
        sum += data.y[idx];
      });
      return sum;
    });
    // Initially, Others equals the static base because all top companies are visible.
    const initialOthers = othersStatic.slice();

    // Create the "Others" trace.
    traces.push({
      x: sortedYearQuarters,
      y: initialOthers,
      type: this.currentPlotType as Plotly.PlotType,
      mode: this.currentPlotType === 'line' ? 'lines+markers' : undefined,
      name: 'Others',
      hovertemplate: `Others<br>Average Sales: %{y}<extra></extra>`,
      marker: { color: '#D3D3D3', size: this.currentPlotType === 'line' ? 8 : undefined },
      line: { width: this.currentPlotType === 'line' ? 2 : undefined },
    });

    // STEP 7: Define the layout.
    const layout: Partial<Plotly.Layout> = {
      title:
        this.currentPlotType === 'bar'
          ? 'Average Tablet Sales by Year and Quarter (Stacked by Company)'
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

    Plotly.newPlot('tabletSalesDiv', traces, layout).then(() => {
      this.isLoading = false;
      tabletSalesDiv.on('plotly_click', (data: any) => this.handlePointClick(data));

      // Use a flag to avoid infinite recursion during dynamic updates.
      let isUpdatingOthers = false;

      // STEP 9: Dynamically recalculate the "Others" trace when a top company is toggled.
      tabletSalesDiv.on('plotly_restyle', (eventData: any) => {
        if (isUpdatingOthers) return;
        isUpdatingOthers = true;

        // Get current plot data.
        const currentData: any[] = tabletSalesDiv.data;
        // For each quarter, recalc Others: start with the static value, then add hidden top companies.
        const updatedOthers = sortedYearQuarters.map((_, idx) => {
          let sum = othersStatic[idx];
          // Top companies are in traces indices 0 to TOP_N-1.
          for (let i = 0; i < topCompanies.length; i++) {
            if (currentData[i].visible === 'legendonly') {
              sum += topCompanyYs[i][idx];
            }
          }
          return sum;
        });

        // Update the "Others" trace (assumed to be the last trace).
        Plotly.restyle('tabletSalesDiv', { y: [updatedOthers] }, [traces.length - 1])
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
