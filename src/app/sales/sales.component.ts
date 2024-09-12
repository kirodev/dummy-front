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
  activeTab = 'sales'; // Default active tab
  private plotRendered = false;
  private comparisonPlotRendered = false;
  constructor(private salesService: SalesService) { }

  ngOnInit(): void {
    this.loadSales();
    this.loadPlotlyScript();

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

    let infoText = `<strong>Company:</strong> ${this.sanitizeHtml(customData.company)}<br>`;
    infoText += `<strong>Year:</strong> ${this.sanitizeHtml(customData.year)}<br>`;
    infoText += `<strong>Quarter:</strong> ${this.sanitizeHtml(customData.quarter)}<br>`;
    infoText += `<strong>Sales:</strong> ${customData.sales ? customData.sales.toFixed(2) : 'N/A'}<br><br>`;

    // Function to extract and format domain from URL
    const extractDomain = (url: string): string => {
      try {
        const { hostname } = new URL(url);
        return hostname.replace(/^www\./, '');
      } catch (e) {
        console.error('Invalid URL:', url);
        return 'Invalid URL';
      }
    };

    // Function to create safe link
    const createSafeLink = (url: string): string => {
      const sanitizedUrl = this.sanitizeUrl(url);
      const domain = extractDomain(url);
      return `<a href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer">${this.sanitizeHtml(domain)}</a>`;
    };

    // Handling sources
    infoText += '<strong>Source:</strong><br>';
    customData.source.forEach((source: any) => {
      if (source.source !== source.discarded) {
        const links = source.link.split(';')
          .filter((link: string) => link.trim() !== '')
          .map(createSafeLink)
          .join(', ');
        if (links) {
          infoText += `${this.sanitizeHtml(source.source)}: ${source.sales} (${links})<br>`;
        }
      }
    });

    // Handling used
    const usedSet = new Set<string>();
    customData.source.forEach((source: any) => {
      if (source.used && source.used.trim() !== '') {
        const links = source.link.split(';')
          .filter((link: string) => link.trim() !== '')
          .map(createSafeLink)
          .join(', ');
        if (links) {
          usedSet.add(`${this.sanitizeHtml(source.used)} (${links})`);
        }
      }
    });
    if (usedSet.size > 0) {
      infoText += '<br><strong>Used:</strong><br>';
      usedSet.forEach(item => {
        infoText += `${item}<br>`;
      });
    }

    // Handling discarded
    const discardedSet = new Set<string>();
    customData.source.forEach((source: any) => {
      if (source.source === source.discarded) {
        const links = source.link.split(';')
          .filter((link: string) => link.trim() !== '')
          .map(createSafeLink)
          .join(', ');
        if (links) {
          discardedSet.add(`${this.sanitizeHtml(source.source)}: ${source.sales} (${links})`);
        }
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


  plotComparisonData(): void {
    if (!this.salesList || this.salesList.length === 0) {
      console.error('No sales data available');
      return;
    }

    const comparisonDiv: any = document.getElementById('comparisonDiv');
    if (!comparisonDiv) {
      console.error('Target div for Plotly comparison graph not found');
      return;
    }

    const salesMap = new Map<string, { total: number, companies: Map<string, number> }>();

    // Group sales data by year, quarter, and company
    this.salesList.forEach(item => {
      if (item.years && item.quarters && item.company && item.total !== undefined && item.sales !== undefined) {
        const key = `${item.years}|${item.quarters}`;
        let data = salesMap.get(key);
        if (!data) {
          data = { total: Number(item.total), companies: new Map<string, number>() };
          salesMap.set(key, data);
        } else {
          // Update total if it's larger (in case of inconsistent data)
          data.total = Math.max(data.total, Number(item.total));
        }
        data.companies.set(item.company, Number(item.sales));
      }
    });

    const xValues = Array.from(salesMap.keys()).sort();
    const companies = Array.from(new Set(this.salesList.map(item => item.company)));

    const traces: Partial<Plotly.PlotData>[] = [];

    // Create company traces
    companies.forEach(company => {
      const yValues = xValues.map(key => salesMap.get(key)?.companies.get(company) || 0);
      traces.push({
        x: xValues,
        y: yValues,
        type: 'bar',
        name: company,
        marker: { color: this.generateRandomColor() },
        hoverinfo: 'y+name',
        hovertemplate: '%{y:.1f}<extra></extra>'
      });
    });

    // Calculate and add "Others" trace
    const othersTrace: Partial<Plotly.PlotData> = {
      x: xValues,
      y: xValues.map(key => {
        const data = salesMap.get(key);
        if (data) {
          const companySum = Array.from(data.companies.values()).reduce((sum, sales) => sum + sales, 0);
          return Math.max(0, data.total - companySum); // Ensure non-negative value
        }
        return 0;
      }),
      type: 'bar',
      name: 'Others',
      marker: { color: 'lightgrey' },
      hoverinfo: 'y+name',
      hovertemplate: '%{y:.1f}<extra></extra>'
    };
    traces.push(othersTrace);

    const layout: Partial<Plotly.Layout> = {
      height: 600,
      autosize: true,
      title: 'Comparison of Sales and Others',
      barmode: 'stack',
      xaxis: {
        title: 'Year and Quarter',
        tickangle: -45,
        tickmode: 'array',
        tickvals: xValues,
        ticktext: xValues
      },
      yaxis: {
        title: 'Sales Amount',
        type: 'linear',
        rangemode: 'tozero'
      },
      legend: {
        traceorder: 'normal'
      }
    };

    // Wait for Plotly to be loaded
    const interval = setInterval(() => {
      if (window['Plotly']) {
        clearInterval(interval);
        Plotly.newPlot('comparisonDiv', traces, layout).then(() => {
          console.log('Comparison graph plotted successfully');

          comparisonDiv.on('plotly_restyle', () => {
            const updatedTraces = comparisonDiv.data;
            const othersTrace = updatedTraces[updatedTraces.length - 1];

            othersTrace.y = xValues.map((key, index) => {
              const periodData = salesMap.get(key);
              if (periodData) {
                let visibleSum = 0;
                updatedTraces.forEach((trace: any, traceIndex: number) => {
                  if (traceIndex < updatedTraces.length - 1 && trace.visible !== 'legendonly') {
                    visibleSum += trace.y[index] || 0;
                  }
                });
                return Math.max(0, periodData.total - visibleSum);
              }
              return 0;
            });

            Plotly.redraw('comparisonDiv');
          });
        }).catch((error: any) => {
          console.error('Error plotting comparison graph:', error);
        });
      }
    }, 100);
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

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    // Trigger a resize event to make sure Plotly graphs render correctly in tabs
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }
}
