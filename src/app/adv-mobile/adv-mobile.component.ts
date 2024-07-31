import { Router } from '@angular/router';
import { Component, EventEmitter, Output, ViewChild, AfterViewInit } from '@angular/core';
import { SpiderChartComponent } from 'src/app/spider-chart/spider-chart.component'; 
import { DataSharingService } from '../data-sharing-service.service';
import { TableDataService } from '../table-data-service.service';
import { CellSelectionService } from '../cell-selection-service.service';
import { Renderer2 } from '@angular/core';
import { ConnectionService } from '../connection.service';

@Component({
  selector: 'app-adv-mobile',
  templateUrl: './adv-mobile.component.html',
  styleUrls: ['./adv-mobile.component.css']
})

export class AdvMobileComponent {
  @Output() selectedCellNamesChanged = new EventEmitter<string[]>();
  @ViewChild(SpiderChartComponent) spiderChartComponent!: SpiderChartComponent; // Use "undefined"

  licensees: string[] = [];
  licensors: string[] = [];
  tableData: string[][] = [];
  selectedCells: { rowName: string; colName: string }[] = [];
  selectedCellNames: string[] = [];
  licenseeName: any;
  licensorName: any;
  dynamicTitle!: string;
  cellColors: { row: number; col: number; color: string }[] = [];
  unselectedCells: { row: number; col: number }[] = [];




  fetchLicenseData(): void {
    this.connectionService.getData().subscribe(data => {
      const uniqueRows = [...new Set(data.map(item => item.licensor))];
      this.licensors = uniqueRows;
      const uniqueColumns = [...new Set(data.map(item => item.licensee))];
      this.licensees = uniqueColumns;
      this.initializeTableData(); // Initialize tableData after fetching unique rows
    });
  }
  
  initializeTableData(): void {
    // Initialize tableData with all cells set to green color
    for (let i = 0; i < this.licensors.length; i++) {
      const row: string[] = [];
      for (let j = 0; j < this.licensees.length; j++) {
        row.push('green'); // Set every cell to green
      }
      this.tableData.push(row);
    }
  }

  constructor(  private renderer: Renderer2
,private tableDataService: TableDataService,
 private dataSharingService: DataSharingService,
 private cellSelectionService: CellSelectionService,
     private connectionService: ConnectionService // Inject ConnectionService
) {
    for (let i = 0; i < this.licensors.length; i++) {
      const row: string[] = [];
      for (let j = 0; j < this.licensees.length; j++) {
        row.push(this.getRandomColor());


        if (Math.random() < 0.1) {
          row[j] = 'orange';
        }
      }
      this.tableData.push(row);
    }
  }
  retrievedUnselectedCells: { row: number; col: number }[] = [];

  ngOnInit() {
    this.fetchLicenseData();
    const unselectedCellsJson = localStorage.getItem('unselectedCells');
    this.retrievedUnselectedCells = unselectedCellsJson
  ? JSON.parse(unselectedCellsJson)
  : [];

// Change the color of retrieved unselected cells to red
for (const cell of this.retrievedUnselectedCells) {
  this.changeCellColor(cell.row, cell.col, 'red');
}

if (this.retrievedUnselectedCells.length > 0) {
  // Create a message with cell row and column names
  const cellCoordinates = this.retrievedUnselectedCells
    .map(cell => ` ${this.licensors[cell.row]} - ${this.licensees[cell.col]}`)
    .join('\n');

  // Display an alert with the cell coordinates
  const retrievedcompanyName = localStorage.getItem('licenseeName');
    const retrievedversusName = localStorage.getItem('licensorName');

    if (retrievedcompanyName && retrievedversusName) {
      this.licenseeName = retrievedcompanyName;
      this.licensorName = retrievedversusName;

      // You can also set the dynamicTitle here if needed
      this.dynamicTitle = ` ${this.licensorName}-${this.licenseeName}`;
    
    }
}

console.log('Retrieved unselected cells:', this.retrievedUnselectedCells);
    
    // Iterate through unselectedCells and change the cell color to red
    for (const cell of this.retrievedUnselectedCells) {
      this.changeCellColor(cell.row, cell.col, 'red');
    }
    // Check if cell colors are saved in local storage, if not, generate random colors
    const savedCellColors = localStorage.getItem('cellColors');
    if (savedCellColors) {
      this.tableData = JSON.parse(savedCellColors);
    } else {
      this.generateRandomCellColors();
    }
  
    // Load selected cells from localStorage when the component initializes
    const savedSelectedCells = localStorage.getItem('selectedCells');
    if (savedSelectedCells) {
      this.selectedCells = JSON.parse(savedSelectedCells);
      this.restoreSelectedCellColors();
    }
  
  }
  
  changeCellColor(rowIndex: number, colIndex: number, color: string) {
    // Change the cell color in the component data
    this.tableData[rowIndex][colIndex] = color;
  
    // Change the cell color in CSS using Renderer2
    const cellElement = document.querySelector(
      `.white-cell[_ngcontent-ng-c3863094594]:nth-child(${rowIndex + 1}) :nth-child(${colIndex + 1})`
    );
  
    if (cellElement) {
      this.renderer.setStyle(cellElement, 'background-color', color);
    }
  }
  
  ngAfterViewInit() {
    // This is the best place to access this.spiderChartComponent
      if (this.spiderChartComponent) {
      this.spiderChartComponent.updateSpiderChart();
    }
  }
  ngOnDestroy() {
    // Save cell colors to localStorage when the component is destroyed
    localStorage.setItem('cellColors', JSON.stringify(this.tableData));
    localStorage.setItem('selectedCells', JSON.stringify(this.selectedCells));
  }
  private generateRandomCellColors() {
    for (let i = 0; i < this.licensors.length; i++) {
      const row: string[] = [];
      for (let j = 0; j < this.licensees.length; j++) {
        const isUnselected = this.isCellUnselected(i, j);
        if (isUnselected) {
          row.push('bleu');
        } else {
          row.push(this.getRandomColor());
        }
      }
      this.tableData.push(row);
    }
  }
  
  // Helper function to check if a cell is in the unselectedCells array
  isCellUnselected(rowIndex: number, colIndex: number): boolean {
    return this.unselectedCells.some(
      (cell) => cell.row === rowIndex && cell.col === colIndex
    );
  }
  
  resetSelectedCells() {
    // Clear the selectedCells array
    this.selectedCells = [];

    // Update the table data to change the color of selected cells back to green
    this.restoreSelectedCellColors();

    // Clear the selected cell names
    this.selectedCellNames = [];

    // Update the Spider Chart by calling its method
    if (this.spiderChartComponent) {
      this.spiderChartComponent.updateSpiderChart();
    }
    this.dataSharingService.setSelectedCellsData(this.selectedCells);

    // Update the selectedCells in local storage
    localStorage.setItem('selectedCells', JSON.stringify(this.selectedCells));
  }
  updateTableData() {
    for (const cell of this.unselectedCells) {
      // Get the cell element using its class name
      const cellElement = document.querySelector(`.white-cell[_ngcontent-ng-c3863094594]:nth-child(${cell.row + 1}) :nth-child(${cell.col + 1})`) as HTMLElement;
      
      // Change the background color to red
      if (cellElement) {
        cellElement.style.backgroundColor = 'red';
      }
    }
  }
  

removeSelectedCell(rowIndex: number, colIndex: number): void {
  const licenseeName = this.licensees[colIndex];
  const licensorName = this.licensors[rowIndex];

  // Remove the selected cell from the selectedCells array
  this.selectedCells = this.selectedCells.filter(
    (cell) => !(cell.rowName === licensorName && cell.colName === licenseeName)
  );

  // Update the selectedCells in local storage
  localStorage.setItem('selectedCells', JSON.stringify(this.selectedCells));

  // Change the color of the cell back to green in the tableData
  this.tableData[rowIndex][colIndex] = 'green';
  this.dataSharingService.setSelectedCellsData(this.selectedCells);
}


  getRowIndex(rowName: string): number {
    return this.licensors.indexOf(rowName);
  }

  getColIndex(colName: string): number {
    return this.licensees.indexOf(colName);
  }

  getRandomColor(): string {
    return Math.random() < 0.5 ? 'green' : 'white';
  }

  cellClick(rowIndex: number, colIndex: number): void {
    const cellColor = this.tableData[rowIndex][colIndex];
  
    if (cellColor === 'green' || cellColor === 'blue') {
      const licenseeName = this.licensees[colIndex];
      const licensorName = this.licensors[rowIndex];
      const isSelected = this.isSelectedCell(rowIndex, colIndex);
  
      if (isSelected) {
        // If the cell is already selected, deselect it and change the color to green
        this.selectedCells = this.selectedCells.filter(
          (cell) => !(cell.rowName === licensorName && cell.colName === licenseeName)
        );
      } else {
        // If the cell is not selected, select it, change the color to blue, and store the row and column names
        this.selectedCells.push({ rowName: licensorName, colName: licenseeName });
      }
      this.dataSharingService.setSelectedCellsData(this.selectedCells);

      // Save the selectedCells in local storage

    // Update the Spider Chart
    localStorage.setItem('selectedCells', JSON.stringify(this.selectedCells));
    }
  }
  
  updateSelectedCellNames(event: Event): void {
    // Cast the event target to the HTML element that emitted the event
    const target = event.target as HTMLElement;

    // Extract rowIndex and colIndex from the element's id
    const idParts = target.id.split('-');
    if (idParts.length === 3) {
      const rowIndex = parseInt(idParts[1], 10);
      const colIndex = parseInt(idParts[2], 10);

      // Continue with your logic here
      const cellColor = this.tableData[rowIndex][colIndex];
      const licenseeName = this.licensees[colIndex];
      const licensorName = this.licensors[rowIndex];
      const cellName = `${licensorName} - ${licenseeName}`;

      if (cellColor === 'green') {
        // Toggle cell selection
        const isSelected = this.selectedCellNames.includes(cellName);
        if (isSelected) {
          // Deselect cell
          this.selectedCellNames = this.selectedCellNames.filter((cell) => cell !== cellName);
        } else {
          // Select cell and add to selectedCellNames
          this.selectedCellNames.push(cellName);
        }

      }
    }
  }




  isSelectedCell(rowIndex: number, colIndex: number): boolean {
    return this.selectedCells.some(
      (cell) =>
        cell.rowName === this.licensors[rowIndex] && cell.colName === this.licensees[colIndex]
    );
  }

  getSelectedCellNames(rowIndex: number, colIndex: number): string {
    const licenseeName = this.licensees[colIndex];
    const licensorName = this.licensors[rowIndex];
    return `${licensorName} - ${licenseeName}`;
  }



  getCellDescription(rowIndex: number, colIndex: number): string {
    const cellColor = this.tableData[rowIndex][colIndex];
    const row = this.licensors[rowIndex];
    const company = this.licensees[colIndex];
    if (cellColor === 'green') {
      return `Description is available for ${row} and ${company}`;
    } else if (cellColor === 'white') {
      return `Description is not available for ${row} and ${company}`;
    }
    else { return `We are not sure yet for ${row} and ${company}`; }
  }
  isHovered: boolean = false;

  hoverSpiderChart() {
    this.isHovered = true;
  }

  unhoverSpiderChart() {
    this.isHovered = false;
  }

  private restoreSelectedCellColors() {
    for (const cell of this.selectedCells) {
      const rowIndex = this.getRowIndex(cell.rowName);
      const colIndex = this.getColIndex(cell.colName);
      this.tableData[rowIndex][colIndex] = 'blue';
    }
  }
  isMamHovered: boolean = false;

  hoverMam() {
    this.isMamHovered = true;
  }

  unhoverMam() {
    this.isMamHovered = false;
  }

  isCalculationHovered: boolean = false;

  hoverCalculation() {
    this.isCalculationHovered = true;
  }

  unhoverCalculation() {
    this.isCalculationHovered = false;
  }
  isReportHovered: boolean = false;

  hoverReport() {
    this.isReportHovered = true;
  }

  unhoverReport() {
    this.isReportHovered = false;
  }


}
