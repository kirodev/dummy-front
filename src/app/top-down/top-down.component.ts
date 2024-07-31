import { Component } from '@angular/core';
import * as $ from 'jquery';
import { PopupDialogComponent } from '../popup-dialog/popup-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-top-down',
  templateUrl: './top-down.component.html',
  styleUrls: ['./top-down.component.css']
})
export class TopDownComponent {
  technologies: string[] = ['3G', '4G', '5G', 'WIFI', 'NFC'];
  technologiesTab2: string[] = [
      "Samsung Electronics Co., Ltd.", "Nokia", "LG", "Sony", "Motorola", "Huawei Technologies Co., Ltd.", "HTC", "Lenovo Group Ltd. Group Ltd.", "BLU Products, Inc.","Intel", "Alcatel", "ZTE Corporation", "ASUSTeK Computer Inc.", "Amazon Inc.", "Micromax", "Xiaomi", "Vivo", "Oppo Mobile Telecommunications Corp., Ltd.,", "Blackberry Limited", "Allview", "Apple", "Acer Inc.", "Honor", "Wiko", "Gionee", "Meizu", "Panasonic","Teltronics S.A. Unipersonal ","SII Mobile Comm", "Vodafone", "Energizer", "Siemens", "Lava", "Infinix", "Sharp Corporation", "Celkon", "Microsoft Corporation", "Qmobile", "Tecno", "Karbonn", "T-Mobile", "Coolpad", "Hp", "Xolo", "Prestigio", "Bq", "Archos", "Plum", "Amazon", "Telefonaktiebolaget LM Ericsson ", "Gigabyte", "Philips", "Spice", "Verykool", "Cat", "I-Mate", "Oneplus", "Dell", "O2", "Yezz", "Kyocera Corporation", "Funai Electric Co., Ltd. ","Realme", "Yu", "Palm", "Vertu", "Google LLC", "Leeco", "Pantech Co., Ltd. ", "Sonim", "Toshiba", "Haier", "Orange", "Maxwest", "Blackview", "Sagem", "Eten", "Humax","Qtek", "Benq", "Benq-Siemens", "Bird", "Garmin-ASUS", "NEC Corporation", "Amoi", "Intex", "Jolla", "Nvidia", "Posh", "Yota", "Benefon", "Casio", "Innostream", "Niu", "Parla", "Razer", "Sendo", "Vk", "At&T", "Bosch", "Chea", "Emporia", "Icemobile", "Inq", "Mitac", "Neonode", "Sewon", "Telit", "Unnecto","a US-headquartered company"
    ,"Fujitsu Limited","U-blox AG","Arima","Convida Wireless","Fairphone B.V","Zebra Technologies Corporation","Nufront","Hon Hai","Pegatron","Dallah","VinSmart","Smartron","Tektronix","Hisence","General Mobile","Semp Toshiba","Yulong","EWPE","Digibras","Unknown"];
  
  technologiesForNewTable: string[] = [...this.technologiesTab2]; // Use technologiesTab2 for the new table

  headerValues: number[] = [300, 500, 250]; // Replace with your header values
  percentages: number[][] = [];
  showTooltip: boolean[][] = [];
  dynamicTitle!: string ;
  licenseeName: any;
  licensorName: any;

  constructor(public dialog: MatDialog,private route: ActivatedRoute) {
    this.initializePercentages();
  }

  ngOnInit(): void {
    // Retrieve 'licenseeName' from local storage
    const retrievedcompanyName = localStorage.getItem('licenseeName');
    const retrievedversusName = localStorage.getItem('licensorName');

    if (retrievedcompanyName && retrievedversusName) {
      this.licenseeName = retrievedcompanyName;
      this.licensorName = retrievedversusName;

      // You can also set the dynamicTitle here if needed
      this.dynamicTitle = ` ${this.licensorName}-${this.licenseeName}`;
    
    }
    // Find the index of the company name in the technologiesTab2 array
// Find the index of the company name in the technologiesTab2 array
const companyIndex = this.technologiesTab2.findIndex(row => row.includes(this.licenseeName));

// Check if the company name exists in the array
if (companyIndex !== -1) {
  // Remove the entire row (including the company name) from the technologiesTab2 array
  const removedRow = this.technologiesTab2.splice(companyIndex, 1)[0];
  
  // Insert the company name at index 0 in the technologiesForNewTable array
  this.technologiesForNewTable.splice(0, 0, removedRow);

  // Remove the company name from the technologiesTab2 array
this.technologiesTab2.splice(companyIndex, 1)[0]
  // Call a function to refresh the table display if needed
}
  
this.technologiesForNewTable = this.removeDuplicates(this.technologiesForNewTable);

}
  loadPlotlyScript() {
    throw new Error('Method not implemented.');
  }
  createBoxPlotChart(arg0: string) {
    throw new Error('Method not implemented.');
  }
  removeDuplicates(array: string[]): string[] {
    return Array.from(new Set(array));
  }
  initializePercentages(): void {
    for (let i = 0; i < this.technologiesTab2.length+1; i++) {
      this.percentages[i] = [];
      for (let j = 0; j < 3; j++) {
        this.percentages[i][j] = this.generateRandomPercentage();
      }
    }
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

  // Add other methods as needed

  toggleTooltip(technologyIndex: number, columnIndex: number) {
    this.showTooltip[technologyIndex][columnIndex] = !this.showTooltip[technologyIndex][columnIndex];
  }
}
