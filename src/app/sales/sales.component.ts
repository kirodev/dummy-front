import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { SalesService } from '../sales-service.service';
import { ActivatedRoute, Router } from '@angular/router';
declare var Plotly: any;


@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit {
  @Input() licensee!: string;

  salesList: any[] = [];
  private plotlyLoaded = false;
  private dataLoaded = false;
  isLoading: boolean = true;

  isPopupVisible = false;
  popupText = '';
  activeTab = 'sales'; // Default active tab
  private plotRendered = false;
  private comparisonPlotRendered = false;



  constructor(private salesService: SalesService,private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.loadSalesData();

    this.loadSales();
    this.loadPlotlyScript();
    this.route.queryParams.subscribe((params) => {
      this.activeTab = params['tab'] || 'sales';
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['licensee'] && !changes['licensee'].isFirstChange()) {
      this.loadSalesData(); // Reload data when licensee changes
    }
  }


  loadSalesData(): void {
    this.salesService.getSalesForLicensee(this.licensee).subscribe(
      (data: any[]) => {
        this.salesList = data;
        console.log('Loaded sales data:', data);
      },
      (error: any) => {
        console.error('Error loading sales data:', error);
      }
    );
  }
  ngAfterViewChecked(): void {
    // Re-render the plot when switching tabs
    if (this.plotlyLoaded && this.dataLoaded) {
      if (this.activeTab === 'sales' && !this.plotRendered) {
        this.plotData();
        this.plotRendered = true;
        this.comparisonPlotRendered = false;
      } else if (this.activeTab === 'comparison' && !this.comparisonPlotRendered) {
        this.plotComparisonData();
        this.comparisonPlotRendered = true;
        this.plotRendered = false;
      }
    }
  }
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    // Update the query parameter when switching tabs
    this.router.navigate([], {
      queryParams: { tab: tab },
      queryParamsHandling: 'merge',
    });
  }
  switchTab(tabName: string): void {
    this.activeTab = tabName;
    this.plotRendered = false;
    this.comparisonPlotRendered = false;
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
      this.plotComparisonData();

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
        title: 'Sales Amount (in thousands)',
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
          this.isLoading = false; // Stop loading once plot is rendered

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

    let infoText = `<strong>Company:</strong> ${this.sanitizeHtml(customData.company)}<br>`;
    infoText += `<strong>Year:</strong> ${this.sanitizeHtml(customData.year)}<br>`;
    infoText += `<strong>Quarter:</strong> ${this.sanitizeHtml(customData.quarter)}<br>`;

    // Handle sales for both plots (array for comparison, direct number for plotData)
    const salesValue = Array.isArray(customData.sales)
      ? customData.sales[0]
      : customData.sales;

    infoText += `<strong>Sales:</strong> ${salesValue.toFixed(2)}<br>`;

    if (customData.others !== undefined) {
      infoText += `<strong>Others:</strong> ${customData.others.toFixed(2)}<br>`;
    }

    const extractDomain = (url: string): string => {
      try {
        const { hostname } = new URL(url);
        return hostname.replace(/^www\./, '');
      } catch (e) {
        console.error('Invalid URL:', url);
        return 'Invalid URL';
      }
    };

    const createSafeLink = (url: string): string => {
      const sanitizedUrl = this.sanitizeUrl(url);
      const domain = extractDomain(url);
      return `<a href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer">${this.sanitizeHtml(domain)}</a>`;
    };

    // Display all sources excluding discarded sources
    infoText += '<hr><strong>Sources:</strong><br>';
    const allSources = customData.sources || customData.source || [];
    const displayedSources = allSources.filter((source: any) => source.source !== source.discarded);
    if (displayedSources.length > 0) {
      displayedSources.forEach((source: any) => {
        const links = source.link
          ? source.link.split(';').filter((link: string) => link.trim() !== '').map(createSafeLink).join(', ')
          : 'No link available';

        infoText += `${this.sanitizeHtml(source.source)}: ${source.sales} ${links ? `(${links})` : ''}<br>`;
      });
    } else {
      infoText += 'No valid sources available.<br>';
    }

    // Display discarded sources
    const discardedSet = new Set<string>();
    allSources.forEach((source: any) => {
      if (source.source === source.discarded) {
        const links = source.link
          ? source.link.split(';').filter((link: string) => link.trim() !== '').map(createSafeLink).join(', ')
          : 'No link available';
        discardedSet.add(`${this.sanitizeHtml(source.source)}: ${source.sales} ${links ? `(${links})` : ''}`);
      }
    });

    if (discardedSet.size > 0) {
      infoText += '<hr><strong>Discarded:</strong><br>';
      discardedSet.forEach(item => {
        infoText += `${item}<br>`;
      });
    }

    this.showPopup(infoText);
  }


  plotComparisonData(): void {
    // 1) Purge any existing plot so we start fresh
    Plotly.purge('comparisonDiv');

    // 2) Check if there's any data at all
    if (!this.salesList || this.salesList.length === 0) {
      console.error('No sales data available');
      return;
    }

    // 3) Group sales data by year, quarter, and company
    const salesMap = new Map<string, { total: number, companies: Map<string, { sales: number }> }>();

    this.salesList.forEach(item => {
      if (item.years && item.quarters && item.company && item.sales !== undefined) {
        const key = `${item.years}|${item.quarters}`;
        let data = salesMap.get(key);
        if (!data) {
          data = { total: Number(item.total || 0), companies: new Map<string, { sales: number }>() };
          salesMap.set(key, data);
        }

        if (!data.companies.has(item.company)) {
          data.companies.set(item.company, { sales: Number(item.sales) });
        }
      }
    });

    const xValues = Array.from(salesMap.keys()).sort();
    const companies = Array.from(new Set(this.salesList.map(item => item.company)));

    const traces: Partial<Plotly.PlotData>[] = [];
    const initialOthersMap = new Map<string, number>(); // Store the initial "Others" value for each year/quarter

    // Create company traces
    companies.forEach(company => {
      const yValues: number[] = [];
      const customData: any[] = [];

      xValues.forEach(key => {
        const [year, quarter] = key.split('|');
        const data = salesMap.get(key)?.companies.get(company);
        if (data) {
          yValues.push(data.sales);
          customData.push({
            company,
            year,
            quarter,
            sales: [data.sales],
          });
        } else {
          yValues.push(0);
          customData.push({
            company,
            year,
            quarter,
            sales: [0],
          });
        }
      });

      traces.push({
        x: xValues,
        y: yValues,
        type: 'bar',
        name: company,
        marker: { color: this.generateRandomColor() },
        customdata: customData,
      });
    });

    // STEP 4: Calculate initial "Others" trace.
    const othersMap = new Map<string, number>(); // Tracks the dynamic "Others" values
    xValues.forEach(key => {
      const data = salesMap.get(key);
      if (data) {
        const companySum = Array.from(data.companies.values()).reduce((sum, val) => sum + val.sales, 0);
        const othersValue = Math.max(0, data.total - companySum);
        othersMap.set(key, othersValue);
        initialOthersMap.set(key, othersValue);  // Store the initial value for "Others"
      }
    });

    // STEP 5: Create "Others" trace
    const othersTrace: Partial<Plotly.PlotData> = {
      x: xValues,
      y: [...othersMap.values()],
      type: 'bar',
      name: 'Others',
      marker: { color: 'lightgrey' },
      hoverinfo: 'y+name',
      hovertemplate: '%{y:.1f}<extra></extra>',
      showlegend: true,
      visible: true,
    };
    traces.push(othersTrace);

    const layout: Partial<Plotly.Layout> = {
      height: 600,
      autosize: true,
      title: 'Volume Of Smartphone Sales Over Quarters by Company',
      barmode: 'stack',
      xaxis: {
        title: 'Year and Quarter',
        tickangle: -45,
        tickmode: 'array',
        tickvals: xValues,
        ticktext: xValues,
      },
      yaxis: {
        title: 'Sales Amount (in thousands)',
        type: 'linear',
        rangemode: 'tozero',
      },
      legend: {
        traceorder: 'normal',
      },
    };

    // STEP 6: Render the plot and bind restyle event to update "Others".
    Plotly.newPlot('comparisonDiv', traces, layout).then((chartDiv: any) => {
      this.isLoading = false;

      // Handle the plotly_restyle event
      let isUpdatingOthers = false;
      chartDiv.on('plotly_restyle', () => {
        if (isUpdatingOthers) return;
        isUpdatingOthers = true;

        const currentData: any[] = chartDiv.data;
        const othersIndex = currentData.length - 1;

        // Recalculate the "Others" trace dynamically
        const updatedOthers = xValues.map((key, idx) => {
          let sum = 0;

          // Sum the sales from visible company traces (excluding 'legendonly' traces)
          for (let i = 0; i < currentData.length - 1; i++) {
            if (currentData[i].visible !== 'legendonly') {
              sum += currentData[i].y[idx];
            }
          }

          // If all company bars are hidden, use the total sales for "Others"
          const initialValue = initialOthersMap.get(key) || 0;
          const totalSales = salesMap.get(key)?.total || 0;

          if (currentData.filter(trace => trace.visible !== 'legendonly').length === 0) {
            // If no company bars are visible, set "Others" to the total sales
            return totalSales;
          } else {
            // Subtract the sum of visible company bars from the total sales
            return Math.max(0, totalSales - sum);
          }
        });

        const maxOthers = Math.max(...updatedOthers);
        const newVisible = maxOthers > 0;
        const newShowLegend = maxOthers > 0;
        const newName = maxOthers > 0 ? 'Others' : '';

        // Update the "Others" trace with new values
        Plotly.update(
          'comparisonDiv',
          {
            y: [updatedOthers],
            visible: [newVisible],
            showlegend: [newShowLegend],
            name: [newName]
          },
          {} as any,
          [othersIndex]
        ).then(() => {
          isUpdatingOthers = false;
        }).catch(() => {
          isUpdatingOthers = false;
        });
      });
    });
  }





  // Add these helper methods to your component if not already present
  private sanitizeHtml(input: string): string {
    // Implement HTML sanitization logic here
    // You can use a library like DOMPurify or Angular's built-in sanitizer
    return input.replace(/[&<>"']/g, (char) => {
      const entities: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return entities[char];
    });
  }

  private sanitizeUrl(url: string): string {
    // Implement URL sanitization logic here
    // This is a basic example; consider using a more robust solution
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.toString();
    } catch (e) {
      console.error('Invalid URL:', url);
      return '#';
    }
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
