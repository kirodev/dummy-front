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
  multipleLicensees: any[] = [];
  uniqueLicensees: string[] = [];
  selectedLicensee: string = '';

  constructor(private connectionService: ConnectionService, private http: HttpClient) {}

  ngOnInit(): void {
    this.licensorName = localStorage.getItem('licensorName') || 'Licensor Name';
    this.licenseeName = localStorage.getItem('licenseeName') || 'licenseeName';
    this.dynamicTitle = `${this.licensorName} vs ${this.licenseeName}`;
    this.fetchLicenseData();
    this.fetchMultipleLicenseesData();
    this.fetchDistinctLicensees(); 
    this.fetchAllLicensees();
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

  openPDFViewerPopup(documentName: string, details: string): void {
    const url = `/assets/${documentName}`;
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
    // Your plotting logic here
  }

  confirmAction(message: string, action: () => void): void {
    const confirmDialog = confirm(message);
    if (confirmDialog) {
      action(); 
    }
  }

  updateRow(item: any): void {
    if (item.licensee === 'Unknown') {
      item.licensee = this.licenseeName;
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

  fetchDistinctLicensees(): void {
    if (this.uniqueLicensees.length === 0) {
      this.connectionService.getLicensees().subscribe(
        (licensees: string[]) => {
          this.uniqueLicensees = [...new Set(licensees)];
          this.fetchAllLicensees();
          console.log('Distinct Licensees:', this.uniqueLicensees);
        },
        (error: any) => {
          console.error('Error fetching licensees:', error);
        }
      );
    }
  }
  fetchMultipleLicenseesData(): void {
    this.connectionService.getMultipleLicensees().subscribe(
      (data: any[]) => {
        console.log('Licensee data from server:', data);
        this.multipleLicensees = data;
        this.initializeUniqueLicensees(); 
        console.log('Unique Licensees:', this.uniqueLicensees);
      },
      (error) => {
        console.error('Error fetching data for multiple licensees:', error);
      }
    );
  }

  initializeUniqueLicensees(): void {
    const uniqueLicensees = this.multipleLicensees.reduce((acc: string[], curr: any) => {
      if (!acc.includes(curr.licensee)) {
        acc.push(curr.licensee);
      }
      return acc;
    }, []);
    this.uniqueLicensees = uniqueLicensees;
  }

  fetchAllLicensees(): void {
    this.connectionService.getLicensees().subscribe(
      (licensees: string[]) => {
        this.uniqueLicensees = [...new Set(licensees)];
        console.log('Unique Licensees:', this.uniqueLicensees);
      },
      (error) => {
        console.error('Error fetching licensees:', error);
      }
    );
  }
  addToKnownLicensees(item: any): void {
    if (item.selectedLicensees && item.selectedLicensees.length > 0) {
      const selectedLicenseesString = item.selectedLicensees.join(' | ');
      const knownLicensee = item.knownLicensee ? `${item.knownLicensee} | ${selectedLicenseesString}` : selectedLicenseesString;
      const id = item.id; // Make sure to have the ID of the corresponding record
      this.connectionService.updateKnownLicensees(id, knownLicensee).subscribe(
        (response) => {
          console.log('Response from server:', response);
          item.knownLicensee = knownLicensee;
          item.selectedLicensees = []; // Clear selectedLicensees after updating knownLicensee
          console.log('Updated item:', item); // Log the updated item
        },
        (error) => {
          console.error('Error adding known licensee:', error);
        }
      );
    } else {
      console.error('No licensee selected.');
    }
  }
  
  
}

