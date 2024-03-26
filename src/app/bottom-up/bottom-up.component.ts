import { Component } from '@angular/core';
import * as $ from 'jquery';
import { PopupDialogComponent } from '../popup-dialog/popup-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-bottom-up',
  templateUrl: './bottom-up.component.html',
  styleUrls: ['./bottom-up.component.css']
})
export class BottomUpComponent {
  technologies: string[] = ['3G', '4G', '5G', 'WIFI', 'NFC'];
  technologiesTab2: string[] = [
    '3G', '4G', '5G', 'WIFI', 'NFC']
  technologiesForNewTable: string[] = [...this.technologiesTab2]; // Use technologiesTab2 for the new table

  headerValues: number[] = [300, 500, 250]; // Replace with your header values
  percentages: number[][] = [];
  showTooltip: boolean[][] = [];
  valuesColumn: number[] = []; // Declare the valuesColumn property
  valuesColumnTab2: number[] = []; // Declare the valuesColumnTab2 property for Tab 2
  dynamicTitle: string = '';

  constructor(public dialog: MatDialog) {
    this.initializePercentages();
    this.initializeValues();
    this.initializeValuesTab2();
      this.modifyLaptopColumnWithZeros(); // Call the function to modify the column

  
    // Retrieve the 'licensorName' value from local storage
    const licensorName = localStorage.getItem('licensorName');
  
    // Check if 'licensorName' exists in local storage and use it in your component
    if (licensorName) {
      // Use the retrieved 'licensorName' value in your component logic
      this.dynamicTitle = `${licensorName}`;
    } else {
      // Handle the case where 'licensorName' is not found in local storage
      console.error('licensorName is not found in local storage');
    }
  }
  initializePercentages(): void {
    for (let i = 0; i < this.technologiesTab2.length; i++) {
      this.percentages[i] = [];
      for (let j = 0; j < 3; j++) {
        this.percentages[i][j] = this.generateRandomPercentage();
      }
      
      // Set the "Laptop" column (index 2) and "Total" column (index 3) to 0% for rows 3G, 4G, and 5G
      if (i <= 2) {
        this.percentages[i][1] = 0; // "Laptop" column
        this.percentages[i][3] = 0; // "Total" column
      }
    }
  }
  
  initializeValues(): void {
    this.valuesColumn = this.technologies.map(() => this.generateRandomValue());
  }
  initializeValuesTab2(): void {
    this.valuesColumnTab2 = this.technologiesForNewTable.map(() => this.generateRandomValueTab2());
  }
  modifyLaptopColumnWithZeros(): void {
    const laptopColumnIndex = this.technologiesTab2.indexOf('Laptop'); // Find the index of 'Laptop'
    if (laptopColumnIndex !== -1) {
      // Check if 'Laptop' is in the technologiesTab2 array
      for (let i = 0; i < this.technologiesTab2.length; i++) {
        if (i >= 0 && i <= 2) {
          // Set percentages to 0 for rows 3G to 5G (indexes 0 to 2)
          this.percentages[i][laptopColumnIndex] = 0;
        }
      }
    }
  }
  
  generateRandomValueTab2(): number {
    return Math.random() * 60 + 20; // Generates values between 20 and 80
  }
  getTooltipContent(percentage: number, technologyIndex: number): string {
    const amount = (percentage * this.headerValues[0] / 100).toFixed(2) + ' M$';
    return `Amount: ${amount}`;
  }
  selectedPercentage!: number;

  openPercentageDialog(percentage: number): void {
    // Pass the percentage and product values to the dialog
    const productValues = this.headerValues; // You can adjust this as needed
    this.dialog.open(PopupDialogComponent, {
      data: { percentage, productValues },
    });
  }
  

  hidePercentageModal() {
    const modal = document.getElementById('percentageModal');
    if (modal) {
      modal.classList.remove('show'); // Remove 'show' class to hide the modal
    }
  }
  calculateTotal(technologyIndex: number): number {
    let total = 0;
    
    // Check if percentages[technologyIndex] is defined
    if (this.percentages[technologyIndex]) {
      for (let i = 0; i < this.headerValues.length; i++) {
        // Check if percentages[technologyIndex][i] is defined
        if (this.percentages[technologyIndex][i] !== undefined) {
          total += (this.percentages[technologyIndex][i] / 100) * this.headerValues[i];
        } else {
          console.error(`percentage[${technologyIndex}][${i}] is undefined.`);
        }
      }
    } else {
      console.error(`percentages[${technologyIndex}] is undefined.`);
    }
    
    return total;
  }
  calculateValuesTotal(): number {
    return this.headerValues.reduce((acc, value) => acc + value, 0);
  }
  
  generateRandomPercentage(): number {
    return Math.random() * 10;
  }
  generateRandomValue(): number {
    return Math.random() * 100 + 100; // Generates values between 100 and 200
  }

  // Add other methods as needed

  toggleTooltip(technologyIndex: number, columnIndex: number) {
    this.showTooltip[technologyIndex][columnIndex] = !this.showTooltip[technologyIndex][columnIndex];
  }
}
