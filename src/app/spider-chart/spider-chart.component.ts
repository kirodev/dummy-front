import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Data } from 'plotly.js';
import { DataSharingService } from '../data-sharing-service.service';
import { TableDataService } from '../table-data-service.service';
declare var Plotly: any;

@Component({
  selector: 'app-spider-chart',
  templateUrl: './spider-chart.component.html',
  styleUrls: ['./spider-chart.component.css']
})
export class SpiderChartComponent implements OnInit, OnChanges {
  @Input() selectedCells: { rowName: string; colName: string }[] = [];
  selectedCellNames!: string[];
  selectedCellData: { rowName: string; colName: string }[] = [];
  existingData: Data[] = []; // Declare existingData as a class property


  constructor(private route: ActivatedRoute, private dataSharingService: DataSharingService,private tableDataService: TableDataService,    private changeDetectorRef: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    // Retrieve selected cell data from the route state
    this.dataSharingService.getSelectedCellsData().subscribe((data) => {
      this.selectedCells = data;
      this.updateSpiderChart();
    });

    // Retrieve selected cell data from local storage
    const storedData = localStorage.getItem('selectedCells');
    if (storedData) {
      this.selectedCells = JSON.parse(storedData);
      this.updateSpiderChart();
    }
    this.dataSharingService.setSelectedCellsData(this.selectedCells);
    console.log('Updating spider chart...');
    console.log('Selected cells:', this.selectedCells);
  }
  tableData: string[][] = this.tableDataService.getTableData();
  cellColors: { row: number; col: number; color: string }[] = this.tableDataService.getCellColors();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCells']) {
      this.updateSpiderChart();
    }
    this.dataSharingService.setSelectedCellsData(this.selectedCells);

  }
  
  ngAfterViewInit(): void {
    this.updateSpiderChart();
  }


  updateSpiderChart(): void {
    // Use selectedCells to set legend names dynamically
    const legendNames = this.selectedCells.map((cell) => `${cell.rowName} - ${cell.colName}`);
  
    // Replace this data with your dynamic data
    const getRandomValue = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };
  
    // Maintain existing data
    const existingData: Data[] = this.existingData || [];
  
    const data: Data[] = legendNames.map((name) => {
      // Check if the name already exists in existingData
      const existingItem = existingData.find((item) => item.name === name);
  
      if (existingItem) {
        return existingItem; // Use existing data for this name
      } else {
        // Generate random values for the new name
        const newData: Data = {
          type: 'scatterpolar',
          r: [
            getRandomValue(0.1, 1),
            getRandomValue(0.1, 1),
            getRandomValue(0.1, 1),
            getRandomValue(0.1, 1),
            getRandomValue(0.1, 1)
          ],
          theta: ['Licensed IP', 'Scope of License', 'Royalty Structure', 'Payment Conditions', 'Compliance'],
          fill: 'toself',
          name // Use the selected cell name as trace name
        };
  
        // Add the new data to existingData
        existingData.push(newData);
  
        return newData;
      }
      this.dataSharingService.setSelectedCellsData(this.selectedCells);

    });
  
    this.existingData = existingData; // Store the updated existing data
  
    const layout = {
      polar: {
        radialaxis: {
          visible: true,
          range: [0, 1]
        }
      },
      showlegend: true,
      paper_bgcolor: 'white'
    };
  
    // Ensure that the 'spiderChart' element exists
    const spiderChartElement = document.getElementById('spiderChart');
    if (spiderChartElement) {
      // Clear the chart before updating (optional but can help)
      Plotly.purge(spiderChartElement);

      // Create the new chart inside the 'spiderChart' element with updated data and layout
      Plotly.newPlot(spiderChartElement, data, layout);

      // Log that the chart has been updated
      console.log('Spider chart updated with new data:', data);
    }
    this.changeDetectorRef.detectChanges();

  }
  
}
