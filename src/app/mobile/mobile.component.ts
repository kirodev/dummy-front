import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CellSelectionService } from '../cell-selection-service.service';
import { ConnectionService } from '../connection.service';
import { PaymentConnection } from '../payment-connection.service';

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
  paymentsData: any[] = [];
  multiplePayments: any[] = [];
  multipleLicenses: any[] = [];

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
    this.connectionService.getData().subscribe((data: any[]) => {
        this.fetchedData = data;
        const uniqueLicensors = [...new Set(data.map((item: any) => item.licensor))];
        this.licensors = uniqueLicensors.filter(licensor => licensor !== null);
        const uniqueLicensees = [...new Set(data.map((item: any) => item.licensee))];
        this.licensees = uniqueLicensees.filter(licensee => licensee !== 'Unknown' && licensee !== null);

        // Fetch payments data and merge licensees and licensors
        this.paymentConnection.getPayments().subscribe((payments: any[]) => {
            this.paymentsData = payments;
            const paymentLicensors = [...new Set(payments.map((item: any) => item.licensor))];
            this.licensors = [...new Set([...this.licensors, ...paymentLicensors.filter(licensor => licensor !== null)])];
            const paymentLicensees = [...new Set(payments.map((item: any) => item.licensee))];
            this.licensees = [...new Set([...this.licensees, ...paymentLicensees.filter(licensee => licensee !== 'Unknown' && licensee !== null)])];

            this.paymentConnection.getMultiplePayments().subscribe((multiplePayments: any[]) => {
                this.multiplePayments = multiplePayments;
                // Initialize tableData after fetching unique licensors and licensees
                this.initializeTableData();
            }, (error) => {
                console.error('Error fetching multiple payments data:', error);
            });

            this.connectionService.getMultipleLicenses().subscribe((multipleLicenses: any[]) => {
                this.multipleLicenses = multipleLicenses;
                // Initialize tableData after fetching unique licensors and licensees
                this.initializeTableData();
            }, (error) => {
                console.error('Error fetching multiple licenses data:', error);
            });
        }, (error) => {
            console.error('Error fetching payments data:', error);
        });
    }, (error) => {
        console.error('Error fetching license data:', error);
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

    // Set corresponding cells to green based on fetched data, payments data, and multiple payments data
    for (const dataItem of this.fetchedData) {
      const licensorIndex = this.licensors.indexOf(dataItem.licensor);
      const licenseeIndex = this.licensees.indexOf(dataItem.licensee);
      if (licensorIndex !== -1 && licenseeIndex !== -1) {
        this.tableData[licensorIndex][licenseeIndex] = 'green';
      }
    }

    for (const payment of this.paymentsData) {
      const licensorIndex = this.licensors.indexOf(payment.licensor);
      const licenseeIndex = this.licensees.indexOf(payment.licensee);
      if (licensorIndex !== -1 && licenseeIndex !== -1) {
        this.tableData[licensorIndex][licenseeIndex] = 'green';
      }
    }

    // Include multiple payments data in the table
    for (const multiplePayment of this.multiplePayments) {
      const licensorIndex = this.licensors.indexOf(multiplePayment.licensor);
      if (licensorIndex !== -1 && multiplePayment.licensee) {
        const licensees: string[] = multiplePayment.licensee.split('|').map((licensee: string) => licensee.trim());
        for (const licensee of licensees) {
          const licenseeIndex = this.licensees.indexOf(licensee);
          if (licenseeIndex !== -1) {
            // Set the corresponding cell in the table to green
            this.tableData[licensorIndex][licenseeIndex] = 'green';
          }
        }
      }
    }

    for (const multipleLicense of this.multipleLicenses) {
      const licensorIndex = this.licensors.indexOf(multipleLicense.licensor);
      if (licensorIndex !== -1 && multipleLicense.licensee) {
        const licensees: string[] = multipleLicense.licensee.split('|').map((licensee: string) => licensee.trim());
        for (const licensee of licensees) {
          const licenseeIndex = this.licensees.indexOf(licensee);
          if (licenseeIndex !== -1) {
            // Set the corresponding cell in the table to green
            this.tableData[licensorIndex][licenseeIndex] = 'green';
          }
        }
      }
    }

    // Order licensees based on the number of green cells (descending order)
    this.licensees.sort((a, b) => {
      const countA = this.tableData.reduce((acc, row, rowIndex) => {
        if (this.tableData[rowIndex][this.licensees.indexOf(a)] === 'green') {
          return acc + 1;
        }
        return acc;
      }, 0);
      const countB = this.tableData.reduce((acc, row, rowIndex) => {
        if (this.tableData[rowIndex][this.licensees.indexOf(b)] === 'green') {
          return acc + 1;
        }
        return acc;
      }, 0);
      return countB - countA; // Sort in descending order of green cells count
    });
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
      this.router.navigate(['/license']);
    } else {
      this.router.navigate(['/payment']);
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
