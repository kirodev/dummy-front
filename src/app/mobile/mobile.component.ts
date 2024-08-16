import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
  filteredTableData: string[][] = [];
  fetchedData: any[] = [];
  paymentsData: any[] = [];
  multiplePayments: any[] = [];
  multipleLicenses: any[] = [];
  searchTerm$ = new BehaviorSubject<string>('');
  searchTerm: string = '';
  sortOrder: 'alphabetical' | 'count' = 'alphabetical';

  constructor(
    private router: Router,
    private cellSelectionService: CellSelectionService,
    private connectionService: ConnectionService,
    private paymentConnection: PaymentConnection
  ) {}

  ngOnInit(): void {
    this.fetchLicenseData();

    this.searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.filterTableData(term);
    });

    // Set the default sort order to 'count' and apply the sorting
    this.sortOrder = 'count';
    this.sortLicensees();
  }


  fetchLicenseData(): void {
    this.connectionService.getData().subscribe(
      (data: any[]) => {
        this.fetchedData = data;
        this.licensors = [...new Set(data.map((item: any) => item.licensor))].filter(licensor => licensor !== null);
        this.licensees = [...new Set(data.map((item: any) => item.licensee))].filter(licensee => licensee !== 'Unknown' && licensee !== null);

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
                    this.initializeTableData();
                    this.sortLicensees();
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
    this.tableData = Array(this.licensors.length).fill(null).map(() =>
      Array(this.licensees.length).fill('white')
    );
    this.updateCellColors();
    this.filteredTableData = this.tableData.map(row => [...row]);
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
    this.updateTableData();
  }

  sortLicenseesByCount(): void {
    this.licensees.sort((a, b) => this.getLicenseeCount(b) - this.getLicenseeCount(a));
    this.updateTableData();
  }

  updateTableData(): void {
    this.tableData = Array(this.licensors.length).fill(null).map(() =>
      Array(this.licensees.length).fill('white')
    );
    this.updateCellColors();
    this.filterTableData(this.searchTerm$.getValue());
  }

  getLicenseeCount(licensee: string): number {
    return this.tableData.map(row => row[this.licensees.indexOf(licensee)]).filter(color => color === 'green').length;
  }

  onSearchInput(): void {
    this.searchTerm$.next(this.searchTerm.trim());
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.searchTerm$.next('');
    this.filteredTableData = this.tableData.map(row => [...row]);
  }



  sortLicensees(): void {
    if (this.sortOrder === 'alphabetical') {
      this.sortLicenseesAlphabetically();
    } else if (this.sortOrder === 'count') {
      this.sortLicenseesByCount();
    }
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

    localStorage.setItem('currentDynamicTitle', dynamicTitle);
    localStorage.setItem('licensorName', licensorName);
    localStorage.setItem('licenseeName', licenseeName);

    this.cellSelectionService.addUnselectedCell({ row: rowIndex, col: colIndex });

    if (cellColor === 'green') {
      this.router.navigate(['/license']);
    } else {
      this.router.navigate(['/payment']);
    }

    const unselectedCells = this.cellSelectionService.getUnselectedCells();
    localStorage.removeItem('unselectedCell');
    localStorage.setItem('unselectedCells', JSON.stringify(unselectedCells));
  }
  private filterTableData(searchTerm: string): void {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    // Determine matching columns
    const matchingColumnIndices: number[] = this.licensees
      .map((licensee, colIndex) => licensee.toLowerCase().includes(lowerCaseSearchTerm) ? colIndex : -1)
      .filter(index => index !== -1);

    // Create arrays for the ordered licensees and table data
    const orderedLicensees: string[] = [];
    const orderedTableData: string[][] = [];

    // Add matching columns first
    matchingColumnIndices.forEach((colIndex) => {
      orderedLicensees.push(this.licensees[colIndex]);
      orderedTableData.push(this.tableData.map(row => row[colIndex]));
    });

    // Add remaining columns
    this.licensees.forEach((licensee, colIndex) => {
      if (!matchingColumnIndices.includes(colIndex)) {
        orderedLicensees.push(licensee);
        orderedTableData.push(this.tableData.map(row => row[colIndex]));
      }
    });

    // Update licensees and table data to the new order
    this.licensees = orderedLicensees;
    this.tableData = orderedTableData[0].map((_, colIndex) => orderedTableData.map(row => row[colIndex]));
  
    // Create a new filtered table data array
    this.filteredTableData = this.tableData.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        const originalColIndex = this.licensees.indexOf(this.licensees[colIndex]);
        return matchingColumnIndices.includes(originalColIndex) ? cell : 'transparent';
      })
    );
  }


}
