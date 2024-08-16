import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CellSelectionService } from '../cell-selection-service.service';
import { ConnectionService } from '../connection.service';
import { PaymentConnection } from '../payment-connection.service';

@Component({
  selector: 'app-mobile',
  templateUrl: './mobile.component.html',
  styleUrls: ['./mobile.component.css']
})
export class MobileComponent implements OnInit {
  licensees: string[] = [];
  licensors: string[] = [];
  tableData: string[][] = [];
  fetchedData: any[] = [];
  paymentsData: any[] = [];
  multiplePayments: any[] = [];
  multipleLicenses: any[] = [];
  searchTerm: string = '';
  sortOrder: 'alphabetical' | 'count' = 'alphabetical'; // Track current sort order

  constructor(
    private router: Router,
    private cellSelectionService: CellSelectionService,
    private connectionService: ConnectionService,
    private paymentConnection: PaymentConnection
  ) {}

  ngOnInit(): void {
    this.fetchLicenseData();
  }

  fetchLicenseData(): void {
    this.connectionService.getData().subscribe(
      (data: any[]) => {
        this.fetchedData = data;
        this.licensors = [...new Set(data.map((item: any) => item.licensor))].filter(licensor => licensor !== null);
        this.licensees = [...new Set(data.map((item: any) => item.licensee))].filter(licensee => licensee !== 'Unknown' && licensee !== null);

        // Fetch payments data and merge licensees and licensors
        this.paymentConnection.getPayments().subscribe(
          (payments: any[]) => {
            this.paymentsData = payments;
            const paymentLicensors = [...new Set(payments.map((item: any) => item.licensor))].filter(licensor => licensor !== null);
            const paymentLicensees = [...new Set(payments.map((item: any) => item.licensee))].filter(licensee => licensee !== 'Unknown' && licensee !== null);

            this.licensors = [...new Set([...this.licensors, ...paymentLicensors])];
            this.licensees = [...new Set([...this.licensees, ...paymentLicensees])];

            this.paymentConnection.getMultiplePayments().subscribe(
              (multiplePayments: any[]) => {
                this.multiplePayments = multiplePayments;

                this.connectionService.getMultipleLicenses().subscribe(
                  (multipleLicenses: any[]) => {
                    this.multipleLicenses = multipleLicenses;
                    // Initialize tableData and apply sorting
                    this.initializeTableData();
                    this.sortLicensees(); // Sort after initialization
                  },
                  (error) => {
                    console.error('Error fetching multiple licenses data:', error);
                  }
                );
              },
              (error) => {
                console.error('Error fetching multiple payments data:', error);
              }
            );
          },
          (error) => {
            console.error('Error fetching payments data:', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching license data:', error);
      }
    );
  }

  initializeTableData(): void {
    this.tableData = [];

    // Initialize tableData with all cells set to white color
    for (let i = 0; i < this.licensors.length; i++) {
      const row: string[] = [];
      for (let j = 0; j < this.licensees.length; j++) {
        row.push('white');
      }
      this.tableData.push(row);
    }

    this.updateCellColors();
  }

  updateCellColors(): void {
    this.applyDataColors(this.fetchedData);
    this.applyDataColors(this.paymentsData);
    this.applyDataColors(this.multiplePayments);
    this.applyDataColors(this.multipleLicenses);
  }

  applyDataColors(data: any[]): void {
    for (const dataItem of data) {
      const licensorIndex = this.licensors.indexOf(dataItem.licensor);
      const licenseeIndex = this.licensees.indexOf(dataItem.licensee);
      if (licensorIndex !== -1 && licenseeIndex !== -1) {
        this.tableData[licensorIndex][licenseeIndex] = 'green';
      }
    }
  }

  sortLicenseesAlphabetically(): void {
    this.licensees.sort();
  }

  sortLicenseesByCount(): void {
    this.licensees.sort((a, b) => {
      const countA = this.getLicenseeCount(a);
      const countB = this.getLicenseeCount(b);
      return countB - countA; // Sort in descending order of green cells count
    });
  }

  getLicenseeCount(licensee: string): number {
    let count = 0;
    this.tableData.forEach(row => {
      const index = this.licensees.indexOf(licensee);
      if (row[index] === 'green') count++;
    });
    return count;
  }

  filterLicensees(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();
    this.updateTableData();
  }
  resetFilters(): void {
    this.searchTerm = ''; // Clear the search term
    this.initializeTableData(); // Reinitialize table data to restore original state
  }


  private updateTableData(): void {
    this.tableData = this.tableData.map((row, rowIndex) => {
      return row.map((cell, colIndex) => {
        const licensee = this.licensees[colIndex];
        if (this.shouldInclude(licensee)) {
          return cell;
        } else {
          return 'transparent'; // Hide the cell
        }
      });
    });
  }

  private shouldInclude(licensee: string): boolean {
    if (!this.searchTerm) return true;
    return licensee.toLowerCase().includes(this.searchTerm);
  }

  public sortLicensees(): void {
    if (this.sortOrder === 'alphabetical') {
      this.sortLicenseesAlphabetically();
    } else if (this.sortOrder === 'count') {
      this.sortLicenseesByCount();
    }
    // Reinitialize tableData after sorting
    this.initializeTableData();
  }

  getCellDescription(rowIndex: number, colIndex: number): string {
    const licensor = this.licensors[rowIndex];
    const licensee = this.licensees[colIndex];
    return `${licensor} - ${licensee}`;
  }

  cellClick(rowIndex: number, colIndex: number): void {
    const licenseeName = this.licensees[colIndex];
    const licensorName = this.licensors[rowIndex];
    const dynamicTitle = licenseeName + '-' + licensorName;
    const cellColor = this.tableData[rowIndex][colIndex];

    // Save the current clicked dynamic title to local storage
    localStorage.setItem('currentDynamicTitle', dynamicTitle);
    localStorage.setItem('licensorName', licensorName);
    localStorage.setItem('licenseeName', licenseeName);

    // Add unselected cell
    this.cellSelectionService.addUnselectedCell({ row: rowIndex, col: colIndex });

    // Navigate based on cell color and clickable cases
    if (cellColor === 'green') {
      this.router.navigate(['/license']);
    } else {
      this.router.navigate(['/payment']);
    }

    // Save unselected cells to local storage
    const unselectedCells = this.cellSelectionService.getUnselectedCells();
    localStorage.removeItem('unselectedCell');
    localStorage.setItem('unselectedCells', JSON.stringify(unselectedCells));
  }
}
