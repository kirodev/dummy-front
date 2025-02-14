import { Component, OnInit, AfterViewChecked, NgZone } from '@angular/core';
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

  constructor(private salesService: SalesService,  private ngZone: NgZone ) {}

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

    // STEP 1: Group data by company and yearQuarter.
    // We'll use a nested map: company -> (yearQuarter -> array of rows)
    const companyGroupMap = new Map<string, Map<string, any[]>>();
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

      if (!companyGroupMap.has(item.company)) {
        companyGroupMap.set(item.company, new Map<string, any[]>());
      }
      const quarterMap = companyGroupMap.get(item.company)!;
      if (!quarterMap.has(yearQuarter)) {
        quarterMap.set(yearQuarter, []);
      }
      // Map the CSV fields.
      quarterMap.get(yearQuarter)!.push({
        ...item,
        yearQuarter,
        averageSales: item.average_sales, // use the CSV field for average sales
        source: item.Source || item.source || '',
        total_discarded: item.total_discarded || item.Total_Discarded || '', // try both variations
      });
    });

    // STEP 2: Create a sorted array of year–quarter labels (used for bar charts)
    const sortedYearQuarters = Array.from(allYearQuarterSet)
      .map((yq) => {
        const [year, quarter] = yq.split(' Q');
        return { year: Number(year), quarter: Number(quarter), yq };
      })
      .sort((a, b) => a.year - b.year || a.quarter - b.quarter)
      .map((item) => item.yq);

    // STEP 3: Build traces for each company.
    const traces: Partial<Plotly.PlotData>[] = [];
    companyGroupMap.forEach((quarterMap, company) => {
      let x: string[] = [];
      let y: number[] = [];
      let customdata: any[] = [];

      if (this.currentPlotType === 'line') {
        // For line charts, use only quarters that have data so the line connects the dots.
        // Sort the company's quarters.
        const companyQuarters = Array.from(quarterMap.keys()).sort((a, b) => {
          const [yearA, qA] = a.split(' Q').map(Number);
          const [yearB, qB] = b.split(' Q').map(Number);
          return yearA === yearB ? qA - qB : yearA - yearB;
        });
        companyQuarters.forEach((q) => {
          const group = quarterMap.get(q)!;
          x.push(q);
          y.push(group[0].averageSales);
          customdata.push(group);
        });
      } else {
        // For bar charts, fill in all quarters (using 0 for missing quarters)
        sortedYearQuarters.forEach((q) => {
          x.push(q);
          if (quarterMap.has(q)) {
            const group = quarterMap.get(q)!;
            y.push(group[0].averageSales);
            customdata.push(group);
          } else {
            y.push(0);
            customdata.push([]);
          }
        });
      }

      traces.push({
        x,
        y,
        type: this.currentPlotType as Plotly.PlotType,
        mode: this.currentPlotType === 'line' ? 'lines+markers' : undefined,
        name: company,
        customdata, // Each element is an array (group) for that quarter.
        hovertemplate: `${company}<br>Average Sales: %{y}<extra></extra>`,
        marker: {
          color: this.generateRandomColor(),
          size: this.currentPlotType === 'line' ? 8 : undefined,
        },
        line: { width: this.currentPlotType === 'line' ? 2 : undefined },
      });
    });

    // STEP 4: Build the "Others" trace.
    // For the "others" values, we pull directly from the CSV column "others"/"Others".
    const othersMap = new Map<string, number>();
    filteredList.forEach((item) => {
      const year = Number(item.year?.toString().trim());
      const quarter = this.getQuarterValue(item.quarter?.toString().trim());
      if (isNaN(year) || isNaN(quarter)) return;
      const yearQuarter = `${year} Q${quarter}`;
      if (item.others || item.Others) {
        const val = Number(item.others || item.Others);
        if (!isNaN(val)) {
          othersMap.set(yearQuarter, val);
        }
      }
    });
    // For bar charts, fill with the CSV value for each quarter.
    // For line charts, use only quarters that are available in othersMap.
    let othersX: string[] = [];
    let othersY: number[] = [];
    if (this.currentPlotType === 'line') {
      othersX = Array.from(othersMap.keys()).sort((a, b) => {
        const [yearA, qA] = a.split(' Q').map(Number);
        const [yearB, qB] = b.split(' Q').map(Number);
        return yearA === yearB ? qA - qB : yearA - yearB;
      });
      othersX.forEach(q => {
        othersY.push(othersMap.get(q) || 0);
      });
    } else {
      othersX = sortedYearQuarters;
      othersY = othersX.map(q => othersMap.get(q) || 0);
    }
    traces.push({
      x: othersX,
      y: othersY,
      type: this.currentPlotType as Plotly.PlotType,
      mode: this.currentPlotType === 'line' ? 'lines+markers' : undefined,
      name: 'Others',
      hovertemplate: `Others<br>Hidden Sales: %{y}<extra></extra>`,
      marker: { color: '#D3D3D3', size: this.currentPlotType === 'line' ? 8 : undefined },
      line: { width: this.currentPlotType === 'line' ? 2 : undefined },
      // Decide if you want this trace visible by default:
      // For now, we'll show it by default.
      showlegend: true,
      visible: true,
    });

    // STEP 5: Define the layout.
    const layout: Partial<Plotly.Layout> = {
      title: this.currentPlotType === 'bar'
        ? 'Average Tablet Sales by Year and Quarter'
        : 'Average Tablet Sales Trend by Year and Quarter',
      barmode: 'stack',
      xaxis: {
        title: 'Year and Quarter',
        tickangle: -45,
        // When in line mode, Plotly will connect the points automatically.
        // For bar mode, we keep the full sorted categories.
        categoryorder: this.currentPlotType === 'bar' ? 'array' : undefined,
        categoryarray: this.currentPlotType === 'bar' ? sortedYearQuarters : undefined,
      },
      yaxis: { title: 'Average Sales' },
      height: 600,
    };

    // STEP 6: Render the plot.
    const tabletSalesDiv = document.getElementById('tabletSalesDiv') as any;
    if (!tabletSalesDiv) {
      console.error('Target div for Plotly not found');
      return;
    }

    console.log('Final traces:', traces);
    Plotly.newPlot('tabletSalesDiv', traces, layout).then((chartDiv: any) => {
      this.isLoading = false;

      // Bind click event on chartDiv
      chartDiv.on('plotly_click', (data: any) => {
        console.log('Bar clicked!', data);
        this.ngZone.run(() => {
          this.handlePointClick(data);
        });
      });

      // Bind restyle event on chartDiv as well (to update "Others" when companies are hidden)
      let isUpdatingOthers = false;
      chartDiv.on('plotly_restyle', () => {
        if (isUpdatingOthers) return;
        isUpdatingOthers = true;

        const currentData: any[] = chartDiv.data;
        const othersIndex = currentData.length - 1;
        const updatedOthers = (this.currentPlotType === 'bar'
          ? sortedYearQuarters
          : othersX
        ).map((q, idx) => {
          let sum = 0;
          // Loop through all company traces (exclude the last trace which is Others).
          for (let i = 0; i < currentData.length - 1; i++) {
            if (currentData[i].visible === 'legendonly') {
              sum += currentData[i].y[idx];
            }
          }
          // Add the original "others" value from the database.
          return (othersMap.get(q) || 0) + sum;
        });

        const maxOthers = Math.max(...updatedOthers);
        const newVisible = maxOthers > 0;
        const newShowLegend = maxOthers > 0;
        const newName = maxOthers > 0 ? 'Others' : '';

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
    // Each point's customdata is an array (group) for that quarter.
    const groupData = Array.isArray(point.customdata) ? point.customdata : [];
    console.log('Group data on click:', groupData);

    // Check if total_discarded values are numeric across the group.
    const allNumeric = groupData.every((row: any) => !isNaN(Number(row.total_discarded)) && row.total_discarded !== '');
    let discardedDisplay: string;
    if (allNumeric) {
      const sumDiscarded = groupData.reduce((acc: number, row: any) => {
        return acc + Number(row.total_discarded || 0);
      }, 0);
      discardedDisplay = sumDiscarded.toLocaleString();
    } else {
      discardedDisplay = groupData.length > 0 ? groupData[0].total_discarded : '';
    }

    let popupContent = `<strong>Company:</strong> ${point.data.name}<br>`;
    popupContent += `<strong>Year and Quarter:</strong> ${point.x}<br>`;
    popupContent += `<strong>Average Sales:</strong> ${point.y.toLocaleString()}<br>`;
    popupContent += `<strong>Discarded:</strong> ${discardedDisplay}<br>`;

    let totalSales = 0;
    const detailsArr = groupData.map((row: any) => {
      totalSales += Number(row.sales);
      const displayedLink = this.extractDomain(row.link);
      return `
        <br><strong>Source:</strong> ${row.source} <br>
        <strong>Sales:</strong> ${Number(row.sales).toLocaleString()} <br>
        ${row.link ? `<strong>Link:</strong> <a href="${row.link}" target="_blank">${displayedLink}</a><br>` : ''}
      `;
    });

    const detailsStr = detailsArr.length > 0
      ? detailsArr.join('<br>')
      : '<em>No individual sales details available.</em>';
    const averageCalculated = groupData.length > 0
      ? (totalSales / groupData.length).toLocaleString()
      : 'N/A';

    popupContent += `<hr><strong>How Average was Calculated:</strong><br><br>`;
    popupContent += `Sum of Sales: ${totalSales.toLocaleString()}<br>`;
    popupContent += `Number of Entries: ${groupData.length}<br>`;
    popupContent += `Calculated Average: ${averageCalculated}<br><br>`;
    popupContent += `<hr><strong>Individual Sales Details:</strong><br>${detailsStr}`;

    this.showPopup(popupContent);
  }



  extractDomain(url: string): string {
    try {
      const domain = new URL(url).hostname;
      const parts = domain.split('.');
      if (parts.length >= 2) {
        return parts[parts.length - 2];
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
