import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ConnectionService } from '../connection.service';
import { HttpClient } from '@angular/common/http';
import { ExamplePdfViewerComponent } from '../example-pdf-viewer/example-pdf-viewer.component';
declare var Plotly: any;

@Component({
  selector: 'app-license-table',
  templateUrl: './license-table-component.component.html',
  styleUrls: ['./license-table-component.component.css']
})
export class LicenseTableComponent implements OnInit {
  @ViewChild(ExamplePdfViewerComponent, { static: false }) pdfViewer!: ExamplePdfViewerComponent;

  licenseData: any[] = [];
  filteredDataDefined: any[] = []; 
  filteredDataUnknown: any[] = [];
  dynamicTitle: string = '';
  licensorName: string = '';
  licenseeName: string = '';
  @Input() pdfSrc: string = '';
  multipleLicenses: any[] = [];
  uniqueLicenses: string[] = [];
  filteredMultipleLicenses: any[] = []; 
  selectedLicense: string = ''; 


  constructor(private connectionService: ConnectionService, private http: HttpClient) {}

  ngOnInit(): void {
    this.licensorName = localStorage.getItem('licensorName') || 'Licensor Name';
    this.licenseeName = localStorage.getItem('licenseeName') || 'licenseeName';
    this.dynamicTitle = `${this.licensorName} vs ${this.licenseeName}`;
    this.fetchLicenseData();
    this.fetchMultipleLicensesData();
    this.multipleLicenses;
    this.fetchDistinctLicenses(); 
    this.loadPlotlyScript().then(() => {
      console.log('Plotly.js script loaded successfully');
      this.plotData();
    }).catch(error => {
      console.error('Error loading Plotly.js script:', error);
    });
  }

  toggleDetails(item: any): void {
    item.showDetails = !item.showDetails;
  }

  fetchLicenseData(): void {
    this.connectionService.getData().subscribe(
      (data: any[]) => {
        this.licenseData = data;
        const matchingRowsDefined = this.licenseData.filter(item => item.licensor === this.licensorName && item.licensee === this.licenseeName);
        const matchingRowsUnknown = this.licenseData.filter(item => item.licensor === this.licensorName && item.licensee === 'Unknown');
        this.filteredDataDefined = matchingRowsDefined;
        this.filteredDataUnknown = matchingRowsUnknown;
        this.plotData();
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  deleteLicenseeFromDatabase(id: any): void {
    this.connectionService.deleteLicense(id).subscribe(
      () => {
        console.log('Licensee deleted successfully');
        window.alert('Licensee deleted successfully');
      },
      (error) => {
        console.error('Error deleting licensee:', error);
      }
    );
  }


  showPDFViewer: boolean = false;
  selectedPDF: string = '';
  showPopup: boolean = false;

  openPDFViewerPopup(directory_path: string, details: string): void {
    const url = `/assets/${directory_path}`;
    this.selectedPDF = url;
    this.showPDFViewer = true;
    this.showPopup = true;
    setTimeout(() => {
      this.pdfViewer.searchPDF(details);
    }, 500);
  }
  closePopup() {
    this.showPopup = false;
  }

  hasDetailsForDynamicTitle(dynamicTitle: string): boolean {
    return this.licenseData.some(item => item.dynamicTitle === dynamicTitle);
  }

  showConfirmationModal: boolean = false;
  actionToConfirm: string = '';
  itemToModifyOrDelete: any;

  openConfirmationModal(action: string, item: any): void {
    this.actionToConfirm = action;
    this.itemToModifyOrDelete = item;
    this.showConfirmationModal = true;
  }

  closeConfirmationModal(): void {
    this.showConfirmationModal = false;
  }

  toggleEditingMode(item: any): void {
    item.editing = true;
    item.updatedDetails = item.details; 
  }

  saveDetails(item: any): void {
    this.connectionService.updateDetails(item.id, item.updatedDetails).subscribe(
      (response) =>  {
        console.log('Details updated successfully:', response);
        window.alert('Details updated successfully');
        item.editing = false; 
        window.location.reload();
      },
      (error) => {
        console.error('Error updating details:', error);
      }
    );
  }

  cancelEditing(item: any): void {
    item.editing = false; 
  }

  toggleDetailsVisibility(item: any): void {
    item.showDetails = !item.showDetails;
  }

  loadPlotlyScript(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const scriptElement = document.createElement('script');
      scriptElement.src = 'https://cdn.plot.ly/plotly-2.25.2.min.js';
      scriptElement.type = 'text/javascript';
      scriptElement.onload = () => {
        resolve();
      };
      scriptElement.onerror = (event: Event | string) => {
        reject(event);
      };
      document.head.appendChild(scriptElement);
    });
  }

  plotData(): void {
    // plotting logic
  }

  confirmAction(message: string, action: () => void): void {
    const confirmDialog = confirm(message);
    if (confirmDialog) {
      action(); 
    }
  }

  updateRow(item: any): void {
    if (item.licensee === 'Unknown') {
      item.licensee = this.licenseeName; // Assign licenseeName to licensee
      this.confirmAction('Are you sure you want to update the licensee?', () => {
        this.connectionService.updateLicense(item.id, item).subscribe(
          (response) => {
            console.log('Row updated successfully:', response);
            this.fetchLicenseData();
          },
          (error) => {
            console.error('Error updating row:', error);
          }
        );
      });
    } else {
      window.alert('Licensee update failed!');
    }
  }
  

  undoUpdateLicense(item: any): void {
    this.confirmAction('Are you sure you want to revert the licensee to Unknown?', () => {
      this.connectionService.undoUpdateLicensee(item.id).subscribe(
        (response) => {
          console.log('Licensee name reverted to Unknown:', response);
          window.alert('Licensee name reverted to Unknown');
          this.fetchLicenseData();
        },
        (error) => {
          console.error('Error reverting licensee name:', error);
          window.alert('Error reverting licensee name');
        }
      );
    });
  }

  fetchDistinctLicenses(): void {
    if (this.uniqueLicenses.length === 0) {
      this.connectionService.getData().subscribe(
        (licenses: string[]) => {
          this.uniqueLicenses = [...new Set(licenses)];
          console.log('Distinct Licensees:', this.uniqueLicenses);
        },
        (error: any) => {
          console.error('Error fetching licensees:', error);
        }
      );
    }
  }

  fetchMultipleLicensesData(): void {
    this.connectionService.getMultipleLicenses().subscribe(
      (data: any[]) => {
        console.log('Payments data from server:', data);
        
        // Filtered based on both licensor and known licensee conditions
        this.filteredMultipleLicenses = data.filter(item => {
          const meetsLicensorCondition = item.licensor === this.licensorName;
          const knownLicenseeString = item.licensee || '';
          const meetsKnownLicenseeCondition = knownLicenseeString.includes(this.licenseeName); // Use includes method
          return meetsLicensorCondition && meetsKnownLicenseeCondition;
        });
  
        // Filtered based on licensor only
        const confirmedTableRows = this.filteredMultipleLicenses.map(item => item.id);
        this.multipleLicenses = data.filter(item => !confirmedTableRows.includes(item.id) && item.licensor === this.licensorName);
        const matchingRowsLicenseeOnly = data.filter(item => item.licensee === this.licenseeName); // Filter for licenseeName only

        
        this.initializeUniqueLicenses();
        console.log('Unique Licenses:', this.uniqueLicenses); // Log the unique licensees array
      },
      (error) => {
        console.error('Error fetching data for multiple licensees:', error);
      }
    );
  }

  
  

 initializeUniqueLicenses(): void {
  console.log("multipleLicenses",this.uniqueLicenses)
    const uniqueLicenses = this.multipleLicenses.reduce((acc: string[], curr: any) => {
      if (!acc.includes(curr.licensee)) {
        acc.push(curr.licensee);
      }
      return acc;
    }, []);
    this.uniqueLicenses = uniqueLicenses;
  }







  updateMultipleLicenses(item: any): void {
    // Concatenate this.licenseeName to the existing licensee value, separated by " | "
    const updatedLicensee = item.licensee ? `${item.licensee} | ${this.licenseeName}` : this.licenseeName;
  
    // Ensure no duplicate names exist
    const uniqueLicensees = new Set(updatedLicensee.split(' | '));
    const updatedLicenseeString = Array.from(uniqueLicensees).join(' | ');
  
    // Update the licensee with the concatenated and unique names
    item.licensee = updatedLicenseeString;
  
    // Decrease the multiplier until it reaches 0
    if (item.multiplier > 0) {
        item.multiplier--;
    }
  
    // Check if the multiplier has reached 0, then hide the row
    if (item.multiplier === 0) {
        const index = this.multipleLicenses.findIndex(license => license.id === item.id);
        if (index !== -1) {
            this.multipleLicenses.splice(index, 1);
        }
    }

    // Ask for confirmation before updating
    const confirmationMessage = 'Are you sure you want to update the licensee?';
    if (window.confirm(confirmationMessage)) {
        // Save the updated payment to the backend
        this.connectionService.updateMultipleLicensee(item.id, item).subscribe(
            (response) => {
                console.log('license updated successfully:', response);
                // Optionally, you can reload data or perform other actions after updating the payment
            },
            (error) => {
                console.error('Error updating payment:', error);
                window.alert('Licensee update failed!');
            }
        );
    }
}

  
}
  
  // addToKnownLicensees(itemId: number, selectedLicensee: string): void {
  //   console.log('Selected Licensee:', selectedLicensee);
  //   this.connectionService.updateKnownLicensee(itemId, selectedLicensee)
  //     .subscribe(
  //       response => {
  //         console.log('Known Licensees updated successfully:', response);
  //       },
  //       error => {
  //         console.error('Error updating known licensees:', error);
  //       }
  //     );
  // }
  
  
  
  
  

  
