import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ExamplePdfViewerComponent } from '../example-pdf-viewer/example-pdf-viewer.component';
import { PaymentConnection } from '../payment-connection.service';
declare var Plotly: any;

@Component({
  selector: 'app-payment-table',
  templateUrl: './payment-table.component.html',
  styleUrls: ['./payment-table.component.css']
})
export class PaymentTableComponent {
  @ViewChild(ExamplePdfViewerComponent, { static: false }) pdfViewer!: ExamplePdfViewerComponent;

  paymentData: any[] = [];
  filteredDataDefined: any[] = []; 
  filteredDataUnknown: any[] = [];
  dynamicTitle: string = '';
  licensorName: string = '';
  licenseeName: string = '';
  @Input() pdfSrc: string = '';
  multiplePayments: any[] = [];
  uniquePayments: string[] = [];
  selectedPayment: string = '';
  filteredMultiplePayments: any[] = []; 

  constructor(private paymentConnection: PaymentConnection, private http: HttpClient) {}

  ngOnInit(): void {
    this.licensorName = localStorage.getItem('licensorName') || 'Licensor Name';
    this.licenseeName = localStorage.getItem('licenseeName') || 'licenseeName';
    this.dynamicTitle = `${this.licensorName} vs ${this.licenseeName}`;
    this.filterPaymentsData();
    this.fetchMultiplePaymentsData();
    this.fetchPaymentsData();
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
  
  fetchPaymentsData(): void {
    this.paymentConnection.getPayments().subscribe(
      (data: any[]) => {
        this.paymentData = data;
        console.log('Payments data:', this.paymentData);
      },
      (error) => {
        console.error('Error fetching payments data:', error);
      }
    );
  }

  createPayment(payment: any): void {
    this.paymentConnection.createPayment(payment).subscribe(
      (response) => {
        console.log('Payment created successfully:', response);
        // Optionally, you can reload data or perform other actions after creating a payment
      },
      (error) => {
        console.error('Error creating payment:', error);
      }
    );
  }



updatePayment(item: any): void {
  if (item.licensee === 'Unknown') {
    item.licensee = this.licenseeName; // Assign licenseeName to licensee
    this.confirmAction('Are you sure you want to update the licensee?', () => {
      this.paymentConnection.updatePayment(item.id, item).subscribe(
        (response) => {
          console.log('Row updated successfully:', response);
          this.filterPaymentsData();
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



  deletePayment(id: number): void {
    this.paymentConnection.deletePayment(id).subscribe(
      () => {
        console.log('Payment deleted successfully');
        // Optionally, you can reload data or perform other actions after deleting a payment
      },
      (error) => {
        console.error('Error deleting payment:', error);
      }
    );
  }
  
  filterPaymentsData(): void {
    this.paymentConnection.getPayments().subscribe(
      (data: any[]) => {
        this.paymentData = data;
        console.log('Payment Data:', this.paymentData);
        console.log('Licensor Name:', this.licensorName);
        console.log('Licensee Name:', this.licenseeName);
  
        // Filter data based on licensorName and licenseeName
        const matchingRowsDefined = this.paymentData.filter(item => item.licensor === this.licensorName && item.licensee === this.licenseeName);
        const matchingRowsUnknown = this.paymentData.filter(item => item.licensor === this.licensorName && item.licensee === 'Unknown');
  
        console.log('Matching Rows Defined:', matchingRowsDefined);
        console.log('Matching Rows Unknown:', matchingRowsUnknown);
  
        // Assign filtered data to separate arrays if needed
        this.filteredDataDefined = matchingRowsDefined;
        this.filteredDataUnknown = matchingRowsUnknown;
        this.plotData();
      },
      (error) => {
        console.error('Error fetching data:', error);
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
    return this.paymentData.some(item => item.dynamicTitle === dynamicTitle);
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
    this.paymentConnection.updateDetails(item.id, item.updatedDetails).subscribe(
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

  
  

  undoUpdatePayment(item: any): void {
    this.confirmAction('Are you sure you want to revert the payment to Unknown?', () => {
      this.paymentConnection.undoUpdatePayment(item.id).subscribe(
        (response) => {
          this.filterPaymentsData();
        },
        (error) => {
          console.error('Error reverting payment name:', error);
          window.alert('Error reverting payment name');
        }
      );
    });
  }


  fetchMultiplePaymentsData(): void {
    this.paymentConnection.getMultiplePayments().subscribe(
      (data: any[]) => {
        console.log('Payments data from server:', data);
        
        // Filter data based on licensor and known licensee conditions
        this.filteredMultiplePayments = data.filter(item => {
          const meetsLicensorCondition = item.licensor === this.licensorName;
          const meetsKnownLicenseeCondition = item.licensee && item.licensee.includes(this.licenseeName); // Check if item.licensee is not null
          console.log('licenseeName:', this.licenseeName);

          console.log('Licensor:', item.licensor);
          console.log('Licensee:', item.licensee);
          console.log('Meets licensor condition:', meetsLicensorCondition);
          console.log('Meets known licensee condition:', meetsKnownLicenseeCondition);
          return meetsLicensorCondition && meetsKnownLicenseeCondition;
        });
  
        // Log the filtered data for debugging
        console.log('Filtered Payments:', this.filteredMultiplePayments);
  
        // Handle case when no data matches the filtering criteria
        if (this.filteredMultiplePayments.length === 0) {
          console.warn('No payments found matching the filtering criteria.');
        }
    
        // Filtered based on licensor only
        const confirmedTableRows = this.filteredMultiplePayments.map(item => item.id);
        this.multiplePayments = data.filter(item => !confirmedTableRows.includes(item.id) && item.licensor === this.licensorName);
        
      },
      (error) => {
        console.error('Error fetching data for multiple licensees:', error);
      }
    );
  }



  

  updateMultiplePayment(item: any): void {
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
      const index = this.multiplePayments.findIndex(payment => payment.id === item.id);
      if (index !== -1) {
        this.multiplePayments.splice(index, 1);
      }
    }
  
    // Save the updated payment to the backend
    this.paymentConnection.updateMultiplePaymentLicensee(item.id, item).subscribe(
      (response) => {
        console.log('Payment updated successfully:', response);
        // Optionally, you can reload data or perform other actions after updating the payment
      },
      (error) => {
        console.error('Error updating payment:', error);
      }
    );
  }

  undoUpdateMultiplePayment(item: any): void {
    this.confirmAction('Are you sure you want to revert the payment to Unknown?', () => {
      this.paymentConnection.undoUpdatePayment(item.id).subscribe(
        (response) => {
          this.filterPaymentsData();
        },
        (error) => {
          console.error('Error reverting payment name:', error);
          window.alert('Error reverting payment name');
        }
      );
    });
  }

  
}
