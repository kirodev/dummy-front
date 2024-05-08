import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ExamplePdfViewerComponent } from '../example-pdf-viewer/example-pdf-viewer.component';
import { PaymentConnection } from '../payment-connection.service';
import { FeedbackPopupComponent } from '../feedback-popup/feedback-popup.component';
import { MatDialog } from '@angular/material/dialog'; // Import MatDialog for opening dialog

declare var Plotly: any;

@Component({
  selector: 'app-payment-table',
  templateUrl: './payment-table.component.html',
  styleUrls: ['./payment-table.component.css']
})
export class PaymentTableComponent {
  @ViewChild(ExamplePdfViewerComponent, { static: false }) pdfViewer!: ExamplePdfViewerComponent;
  @Input() pdfSrc: string = '';

  paymentData: any[] = [];
  filteredDataDefined: any[] = [];
  filteredDataUnknown: any[] = [];
  dynamicTitle: string = '';
  licensorName: string = '';
  licenseeName: string = '';
  multiplePayments: any[] = [];
  uniquePayments: string[] = [];
  selectedPayment: string = '';
  filteredMultiplePayments: any[] = [];

  constructor(private paymentConnection: PaymentConnection, private http: HttpClient, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.licensorName = localStorage.getItem('licensorName') || 'Licensor Name';
    this.licenseeName = localStorage.getItem('licenseeName') || 'licenseeName';
    this.dynamicTitle = `${this.licensorName} vs ${this.licenseeName}`;
    this.filterPaymentsData();
    this.fetchMultiplePaymentsData();
    this.fetchPaymentsData();
    this.fetchDistinctPayments(); 
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

  updatePayment(item: any, comment: string): void {
    console.log('updatePayment method called');
    if (item.licensee === 'Unknown') {
      item.licensee = this.licenseeName; // Assign licenseeName to licensee
      console.log('Before confirmation dialog');
      this.confirmAction('Are you sure you want to update the licensee?', () => {
        console.log('Inside confirmation dialog');
        // Include comment in the request body
        this.paymentConnection.updatePayment(item.id, item, comment).subscribe(
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
      console.log('Licensee update failed!');
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


        // Filter data based on licensorName and licenseeName
        const matchingRowsDefined = this.paymentData.filter(item => item.licensor === this.licensorName && item.licensee === this.licenseeName);
        const matchingRowsUnknown = this.paymentData.filter(item => item.licensor === this.licensorName && item.licensee === 'Unknown');



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



  hasDetailsForDynamicTitle(dynamicTitle: string): boolean {
    return this.paymentData.some(item => item.dynamicTitle === dynamicTitle);
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
    var x = [];
    var y = [];

    // Assuming filteredDataDefined is an array of objects with properties like 'year' and 'payment_amount'
    for (let item of this.filteredDataDefined) {
      x.push(item.year); // Push the year value
      y.push(item.payment_amount); // Push the payment amount
    }

    // Sort the x array
    x.sort();

    var trace = {
      x: x,
      y: y,
      type: "histogram",
    };

    var data = [trace];

    var layout = {
      barmode: "stack",
      xaxis: {
        type: 'category' // Treat x-axis values as categories
      },
      yaxis: {
        title: 'Payment Amount' // Add y-axis title
      }
    };

    Plotly.newPlot('myDiv', data, layout);
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

  fetchDistinctPayments(): void {
    if (this.uniquePayments.length === 0) {
      this.paymentConnection.getPayments().subscribe(
        (data: any[]) => {
          // Extract unique licensees from the data array
          const uniqueLicensees = [...new Set(data.map(item => item.licensee))];
          this.uniquePayments = uniqueLicensees;
        },
        (error: any) => {
          console.error('Error fetching licensees:', error);
        }
      );
    }
  }
  fetchMultiplePaymentsData(): void {
    this.paymentConnection.getMultiplePayments().subscribe(
      (data: any[]) => {
        
        // Filtered based on both licensor and known licensee conditions
        this.filteredMultiplePayments = data.filter(item => {
          const meetsLicensorCondition = item.licensor === this.licensorName;
          const knownLicenseeString = item.licensee || '';
          const meetsKnownLicenseeCondition = knownLicenseeString.includes(this.licenseeName); // Use includes method
          return meetsLicensorCondition && meetsKnownLicenseeCondition;
        });
  
        // Filtered based on licensor only
        const confirmedTableRows = this.filteredMultiplePayments.map(item => item.id);
        this.multiplePayments = data.filter(item => !confirmedTableRows.includes(item.id) && item.licensor === this.licensorName);
        const matchingRowsLicenseeOnly = data.filter(item => item.licensee === this.licenseeName); // Filter for licenseeName only

        
        this.initializeUniquePayments();
       },
      (error) => {
        console.error('Error fetching data for multiple licensees:', error);
      }
    );
  }


  initializeUniquePayments(): void {
    const uniquePayments = this.multiplePayments.reduce((acc: string[], curr: any) => {
      if (!acc.includes(curr.licensee)) {
        acc.push(curr.licensee);
      }
      return acc;
    }, []);
    this.uniquePayments = uniquePayments;
  }



  updateMultiplePayment(item: any, comment: string): void {
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

    // Save the updated payment to the backend, including the comment in the request body
    this.paymentConnection.updateMultiplePaymentLicensee(item.id, item, comment).subscribe(
      (response) => {
        console.log('Payment updated successfully:', response);
        this.fetchMultiplePaymentsData();
      },
      (error) => {
        console.error('Error updating payment:', error);
      }
    );
  }


  undoUpdateMultipleLicense(item: any, comment: string): void {
    this.confirmAction('Are you sure you want to revert the modification?', () => {
      this.paymentConnection.undoUpdateMultiplePayment(item.id, comment).subscribe(
        (response) => {
          console.log('Modification reverted successfully:', response);
          // After successful revert, fetch updated data if needed
          this.fetchMultiplePaymentsData();
        },
        (error) => {
          console.error('Error reverting modification:', error);
          window.alert('Error reverting modification');
        }
      );
    });
  }





  openFeedbackAfterUndo(item: any): void {
    const dialogRef = this.dialog.open(FeedbackPopupComponent, {
      data: { item: item } // Pass item or any other data you need
    });

    dialogRef.afterClosed().subscribe(comment => {
      console.log('The dialog was closed');
      console.log('Feedback comment:', comment); // Handle feedback comment here if needed
      if (comment) {
        // If comment is not empty, proceed with undo action passing the comment
        this.undoUpdateMultipleLicense(item, comment);
      }
    });
  }

  openFeedbackAfterUpdateMultiplePayments(item: any): void {
    const dialogRef = this.dialog.open(FeedbackPopupComponent, {
      data: { item: item } // Pass the updated payment data to the feedback popup
    });

    dialogRef.afterClosed().subscribe(comment => {
      console.log('The dialog was closed');
      console.log('Feedback comment:', comment); // Handle feedback comment here if needed
      if (comment) {
        // If comment is not empty, proceed with update action passing the comment
        this.updateMultiplePayment(item, comment); // Pass the comment here
      }
    });
  }


  openFeedbackAfterUpdate(item: any): void {
    const dialogRef = this.dialog.open(FeedbackPopupComponent, {
      data: { item: item } // Pass the updated payment data to the feedback popup
    });

    dialogRef.afterClosed().subscribe(comment => {
      console.log('The dialog was closed');
      console.log('Feedback comment:', comment); // Handle feedback comment here if needed
      if (comment) {
        // If comment is not empty, proceed with undo action passing the comment
        this.updatePayment(item, comment); // Pass the comment here
      }
    });
  }


  closePopup() {
    this.showPopup = false;
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
      (response) => {
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
  showCommentTooltip(item: any): void {
    item.showComment = true;
  }

  hideCommentTooltip(item: any): void {
    item.showComment = false;
  }
  toggleCommentVisibility(item: any): void {
    item.showComment = !item.showComment;
  }


  cancelEditing(item: any): void {
    item.editing = false;
  }

  toggleDetailsVisibility(item: any): void {
    item.showDetails = !item.showDetails;
  }

  submitFeedbackToDatabase(item: any, feedback: any): void {
    // Here, you should send the feedback to the database using an appropriate HTTP request
    console.log('Submitting feedback to the database:', feedback);
    // Example: this.paymentConnection.submitFeedback(item.id, feedback).subscribe(...);
  }
}