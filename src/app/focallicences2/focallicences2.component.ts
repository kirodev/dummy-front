import { Component, OnInit, AfterViewInit, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

declare var Plotly: any;


@Component({
  selector: 'app-focallicences2',
  templateUrl: './focallicences2.component.html',
  styleUrls: ['./focallicences2.component.css']
})
export class Focallicences2Component {
  dynamicTitle: string = 'Initial Title';
  plotlyChart: any;
  licenseeName: string = ''; 
  licensorName: string = ''; 
  savedCoordinates: string = '';


  constructor(
    private router: Router,

    private route: ActivatedRoute

  ) {}
    myDiv: HTMLElement | null = null;
    ngOnInit(): void {
      this.route.params.subscribe((params) => {
        const dynamicTitle = params['dynamicTitle'];
        [this.licenseeName, this.licensorName] = dynamicTitle.split('-'); 
        this.dynamicTitle = `${this.licensorName} vs. ${this.licenseeName}`;
        
        this.loadPlotlyScript().then(() => {
          this.createBoxPlotChart('%'); // Set the initial scale to C
        });
      });
    }
    

  ngAfterViewInit(): void {
    
  }

  loadPlotlyScript(): Promise<void> {
    return new Promise<void>((resolve) => {
      const scriptElement = document.createElement('script');
      scriptElement.src = 'https://cdn.plot.ly/plotly-2.25.2.min.js';
      scriptElement.type = 'text/javascript';
      scriptElement.onload = () => {
        resolve();
      };
      scriptElement.onerror = (event: Event | string) => {
      };
      document.head.appendChild(scriptElement);
    });
  }

  createBoxPlotChart(scale: string, licenseeName: string = '', licensorName: string = ''): void {
    let data: any[];
    let tickFormat: string;
    let tickValues: number[] = [];
    let tickText: string[] = [];



    if (scale === '%') {
      const bottomDownData = [20, 40, 60, 80, 100];
      const topDownData = [30, 50, 70, 90, 110];
      const comparableLicencingData = [0, 30, 50, 70, 90];
    
      // Normalize the data to the 0% to 100% range
      const normalizeData = (data: number[]) => {
        const max = Math.max(...data);
        return data.map(value => (value / max) * 100);
      };
      
    
      data = [
        {
          x: normalizeData(bottomDownData),
          type: 'box',
          name: 'Bottom-Up',
        },
        {
          x: normalizeData(topDownData),
          type: 'box',
          name: 'Top-Down',
        },
        {
          x: normalizeData(comparableLicencingData),
          type: 'box',
          name: 'Comparable licencing',
        },
        
        
      ];
    
      tickFormat = ',.0%';
      tickValues = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      tickText = tickValues.map(value => `${value}%`);
    } else if (scale === 'C') {
      const bottomDownData = [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
      const topDownData = [0, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
      const comparableLicencingData = [0.025, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4];
    
      // Normalize the data to the 0 to 1 range
      const normalizeData = (data: number[]) => {
        const median = (Math.max(...data) + Math.min(...data)) / 2;
        return data.map(value => (value - median) + 0.5);
      };
    
      data = [
        {
          x: normalizeData(bottomDownData),
          type: 'box',
          name: 'Bottom-Up'
        },
        {
          x: normalizeData(topDownData),
          type: 'box',
          name: 'Top-Down'
        },
        {
          x: normalizeData(comparableLicencingData),
          type: 'box',
          name: 'Comparable licencing'
        },
      
      ];
    
      tickFormat = ',.2f';
      tickValues = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
      tickText = tickValues.map(value => `${value}`);
    } else if (scale === 'M') {
      const bottomDownData = [0, 2500000, 3500000, 4500000, 5500000, 6500000, 7500000, 8500000, 9500000];
      const topDownData = [2500000, 3500000, 4500000, 5500000, 6500000, 7500000, 8500000, 9500000, 10500000];
      const comparableLicencingData = [1500000, 2500000, 3500000, 4500000, 5500000, 6500000, 7500000, 8500000, 9500000];
    
      data = [
        {
          x: bottomDownData,
          type: 'box',
          name: 'Bottom-Up'
        },
        {
          x: topDownData,
          type: 'box',
          name: 'Top-Down'
        },
        {
          x: comparableLicencingData,
          type: 'box',
          name: 'Comparable licencing'
        },
        
      ];
    
      tickFormat = ',.2s';
      tickValues = [0, 1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000, 9000000, 10000000];
      tickText = tickValues.map(value => `${value}`);
    }
     else {
      // Handle the case if 'scale' is not recognized
      return;
    }
    const chartElement = document.getElementById('myDiv');
    const separatorY = data.findIndex(entry => entry.name === 'Comparable licencing') + 0.5;

    chartElement?.addEventListener('plotly_click', () => {
      alert('You clicked this Plotly box plot chart!');
    });
    const layout: Partial<any> = {
      title: `${this.dynamicTitle}`, // Use backticks (`) for interpolation
      xaxis: {
        tickvals: tickValues,
        ticktext: tickText,
        automargin: true,
        showline: false, // Display the y-axis line
        showgrid: false,
        zeroline: false,
        
      },
      yaxis: {
        tickvals: data.map((entry, index) => index), // Existing tickvals
        ticktext: data.map((entry) => entry.name), // Existing ticktext
        automargin: true,
        showline: false, // Display the y-axis line
        zeroline: true,
        showgrid: false,
        tickfont: {
          size: 14, // Adjust the font size as needed
        },
        
      },
      showlegend: false,
      responsive: true,
      zeroline: false,
      
      shapes: [
        {
          type: 'line',
          text: 'FRAND',
          xref: 'paper',
          x0: 0,
          x1: 1,
          yref: 'y',
          y0: data.findIndex(entry => entry.name === 'Comparable licencing') + 0.5,
          y1: data.findIndex(entry => entry.name === 'Comparable licencing') + 0.5,
          line: {
            color: 'black',
            width: 2,
            dash: 'solid',
          },
         
        }
      ],
      annotations: [
        {
          text: 'FRAND', // Text label you want to add
          xref: 'paper',
          x: -0.15, // X position (0.5 is the middle of the plot)
          yref: 'y',
          y: data.findIndex(entry => entry.name === 'Comparable licencing') + 0.5,
          showarrow: false, // Set to false to hide the arrow
        
          font: {
            size: 16, // Adjust the font size as needed
          },
        }
      ],
    };
    
    

    const config = {
     
     
    

    };

  
    // Plot the horizontal box plot chart inside the 'myDiv' element
   // Add event listener for clicking on the box plot chart
   let hoverFlagComparable = false; // Flag to track hover event for Comparable Licencing
   let hoverFlagTopDown = false; // Flag to track hover event for Top-Down
   let hoverFlagBottomDown = false; // Flag to track hover event for Bottom-Up

    Plotly.newPlot('myDiv', data, layout, { displaylogo: false }).then((chart: any) => {
      chart.on('plotly_click', (eventData: any) => {
        // Check if the click event occurred in the 'Comparable licencing' box
        const clickedName = eventData.points[0].data.name;

        if (clickedName === 'Comparable licencing' && hoverFlagComparable) {
          // Save 'licensorName' to local storage when clicking on 'Comparable licencing'
          this.saveVersusNameToLocalStorage(this.licensorName);
          this.saveCompanyNameToLocalStorage(this.licenseeName)
          // Navigate to the SpiderChartComponent for Comparable Licencing
          this.router.navigate(['/adv-mobile']);
        } else if (clickedName === 'Top-Down' && hoverFlagTopDown) {
          // Save 'licensorName' to local storage when clicking on 'Top-Down'
          this.saveCompanyNameToLocalStorage(this.licenseeName)
          this.saveVersusNameToLocalStorage(this.licensorName);

          // Navigate to the SpiderChartComponent for Top-Down
          this.router.navigate(['/top-down']);
        } else if (clickedName === 'Bottom-Up' && hoverFlagBottomDown) {
          // Save 'licensorName' to local storage when clicking on 'Bottom-Up'
          this.saveVersusNameToLocalStorage(this.licensorName);
          // Navigate to the SpiderChartComponent for Bottom-Up
          this.router.navigate(['/bottom-up']);
        } 
      });
   
     chart.on('plotly_hover', (eventData: any) => {
       // Check if the hover event occurred in the 'Comparable licencing' box
       const hoveredName = eventData.points[0].data.name;
   
       // Log the name to the console
       console.log('Hovered Box Plot Name:', hoveredName);
   
       if (hoveredName === 'Comparable licencing') {
         hoverFlagComparable = true;
         hoverFlagTopDown = false;
         hoverFlagBottomDown = false;

       } else if (hoveredName === 'Top-Down') {
         hoverFlagComparable = false;
         hoverFlagTopDown = true;
         hoverFlagBottomDown = false;

       }  

        else {
         hoverFlagComparable = false;
         hoverFlagTopDown = false;
         hoverFlagBottomDown = true;

       }
     });
   }).catch((error: any) => console.error('Plotly error:', error));
   
  }
  saveVersusNameToLocalStorage(licensorName: string) {
    localStorage.setItem('licensorName', licensorName);
  }
  // Inside your TopDownComponent class
  saveCompanyNameToLocalStorage(licenseeName: string) {
  localStorage.setItem('licenseeName', licenseeName);
}


  onScaleButtonClick(scale: string,licenseeName:string,licensorName:string): void {
    this.dynamicTitle = ` ${licensorName} vs. ${licenseeName}`;
    this.onUnitChange(scale);
  }
  
  
  onUnitChange(scale: string): void {
    this.createBoxPlotChart(scale, this.dynamicTitle); // Pass the existing title
  }

}
