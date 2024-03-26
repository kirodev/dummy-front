import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CellSelectionService } from '../cell-selection-service.service';
import { ConnectionService } from '../connection.service';

@Component({
  selector: 'app-mobile',
  templateUrl: './mobile.component.html',
  styleUrls: ['./mobile.component.css']
})
export class MobileComponent {
  licensees: string[] = [];
  licensors: string[] = [];
  tableData: string[][] = [];
  fetchedData: any[] = [];

  constructor(
    private router: Router,
    private cellSelectionService: CellSelectionService,
    private connectionService: ConnectionService
  ) {}

  ngOnInit(): void {
    this.fetchLicenseData();
  }

  fetchLicenseData(): void {
    this.connectionService.getData().subscribe(data => {
      console.log(data); // Log the fetched data to the console
      this.fetchedData = data; // Populate fetchedData with the fetched data
      const uniqueRows = [...new Set(data.map(item => item.licensor))];
      this.licensors = uniqueRows;
      const uniqueColumns = [...new Set(data.map(item => item.licensee))];
      // Filter out "Unknown" and "Null" values from licensees
      this.licensees = uniqueColumns.filter(licensee => licensee !== 'Unknown' && licensee !== null);

      this.initializeTableData(); // Initialize tableData after fetching unique rows
    });
  }

  initializeTableData(): void {
    // Clear existing tableData
    this.tableData = [];

    // Initialize tableData with all cells set to white color
    for (let i = 0; i < this.licensors.length; i++) {
      const row: string[] = [];
      for (let j = 0; j < this.licensees.length; j++) {
        row.push('white');
      }
      this.tableData.push(row);
    }

    // Iterate over the fetched data and set corresponding cells to green
    for (const dataItem of this.fetchedData) {
      const licensorIndex = this.licensors.indexOf(dataItem.licensor);
      const licenseeIndex = this.licensees.indexOf(dataItem.licensee);
      if (licensorIndex !== -1 && licenseeIndex !== -1) {
        this.tableData[licensorIndex][licenseeIndex] = 'green';
      }
    }
  }

  dataContainsLicensorAndLicensee(licensor: string, licensee: string): boolean {
    // Check if the combination of licensor and licensee exists in the data array
    return this.fetchedData.some(item => item.licensor === licensor && item.licensee === licensee);
  }

  cellClick(rowIndex: number, colIndex: number): void {
    const licenseeName = this.licensees[colIndex];
    const licensorName = this.licensors[rowIndex];
    const dynamicTitle = licenseeName + '-' + licensorName;
    const cellColor = this.tableData[rowIndex][colIndex];
  
    // Save the current clicked dynamic title to local storage
    localStorage.setItem('currentDynamicTitle', dynamicTitle);
  
    // Update local storage values with the names from the clicked cell
    localStorage.setItem('licensorName', licensorName);
    localStorage.setItem('licenseeName', licenseeName);
  
    // Add unselected cell
    this.cellSelectionService.addUnselectedCell({ row: rowIndex, col: colIndex });
  
    // Navigate based on cell color and clickable cases
    if (cellColor === 'green') {
      this.router.navigate(['/licence']);
    } else {
      this.router.navigate(['/focallicences2', dynamicTitle]);
    }
  
    // Save unselected cells to local storage
    const unselectedCells = this.cellSelectionService.getUnselectedCells();
    localStorage.removeItem('unselectedCell');
    localStorage.setItem('unselectedCells', JSON.stringify(unselectedCells));
  }
  
  
  

  getCellDescription(rowIndex: number, colIndex: number): string {
    const cellColor = this.tableData[rowIndex][colIndex];
    const row = this.licensors[rowIndex];
    const company = this.licensees[colIndex];

    // Check if the case is clickable and set the cell color to green

    // Generate cell description based on cell color
    if (cellColor === 'green') {
      return `Description is available for ${row} and ${company}.`;
    } else {
      return `Description is not available for ${row} and ${company}.`;
    }
  }

  
}
