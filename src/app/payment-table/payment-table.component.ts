import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ExamplePdfViewerComponent } from '../example-pdf-viewer/example-pdf-viewer.component';
import { PaymentConnection } from '../payment-connection.service';
import { FeedbackPopupComponent } from '../feedback-popup/feedback-popup.component';
import { MatDialog } from '@angular/material/dialog'; // Import MatDialog for opening dialog
import { LicenseTableComponent } from '../license-table-component/license-table-component.component';
import { ConnectionService } from '../connection.service';
import { Observable, throwError, mapTo } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
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
  annualRevenues: any[] = [];
  filteredDataDefined: any[] = [];
  filteredDataUnknown: any[] = [];
  dynamicTitle: string = '';
  licensorName: string = '';
  licenseeName: string = '';
  multiplePayments: any[] = [];
  uniquePayments: string[] = [];
  selectedPayment: string = '';
  filteredMultiplePayments: any[] = [];
  uniqueLicenses: any[] = [];
  licensesMappingIds: string[] = [];
  filteredMappingIds: string[] = [];



  constructor(private paymentConnection: PaymentConnection,  private licenseTableComponent: LicenseTableComponent
,    private http: HttpClient, private dialog: MatDialog , private connectionservice : ConnectionService) { }

  ngOnInit(): void {
    this.licensorName = localStorage.getItem('licensorName') || 'Licensor Name';
    this.licenseeName = localStorage.getItem('licenseeName') || 'licenseeName';
    this.dynamicTitle = `${this.licensorName} vs ${this.licenseeName}`;
    this.filterPaymentsData();
    this.fetchMultiplePaymentsData();
    this.fetchPaymentsData();
    this.fetchDistinctPayments();
    this.populateUniqueMappingIds();
    this.retrieveFilteredMappingIds();
    this.fetchAnnualRevenues();
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
  deleteMultiplePayment(id: number): void {
    this.paymentConnection.deleteMultiplePayment(id).subscribe(
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
    }, 1000);
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





fetchAnnualRevenues(): void {
  this.paymentConnection.getAnnualRevenues().subscribe(
      (data: any[]) => {
          // Filter annualRevenues based on this.licensorName
          this.annualRevenues = data.filter(item => item.licensor === this.licensorName);
          console.log("annualRevenues >>", this.annualRevenues); // Log the filtered data
          this.plotData(); // Call the method to filter and plot data
      },
      (error) => {
          console.error('Error fetching annual revenues:', error); // Log any errors
      }
  );
}
plotData(): void {
  const dataCopy = [...this.filteredDataDefined];

  const yearPaymentsMap = new Map<number, { payment_amount: number, type: string }[]>();

  dataCopy.forEach(item => {
    if (item.payment_type != null) { // Only process items with a non-null payment_type
      const existingRecords = yearPaymentsMap.get(item.year) || [];
      const existingRecord = existingRecords.find(record => record.payment_amount === item.payment_amount);

      if (!existingRecord) {
        existingRecords.push({ payment_amount: item.payment_amount, type: item.payment_type });
      } else if (item.payment_type === "Total revenue recognition") {
        existingRecords.splice(existingRecords.indexOf(existingRecord), 1, { payment_amount: item.payment_amount, type: item.payment_type });
      }

      yearPaymentsMap.set(item.year, existingRecords);
    }
  });

  if (this.annualRevenues) {
    this.annualRevenues.forEach(revenue => {
      const existingRecords = yearPaymentsMap.get(revenue.year) || [];
      const existingRecord = existingRecords.find(record => record.payment_amount === revenue.totalRevenue);

      if (!existingRecord) {
        existingRecords.push({ payment_amount: revenue.totalRevenue, type: "Total Revenues" });
      }

      yearPaymentsMap.set(revenue.year, existingRecords);
    });
  }

  let totalRevenuesTraces: any[] = [];
  let otherTraces: any[] = [];

  // Map to store colors for each payment type
  const paymentTypeColors: Map<string, string> = new Map();

  yearPaymentsMap.forEach((records, year) => {
    records.forEach(record => {
      const type = record.type || "Unknown";

      let color: string;
      if (!paymentTypeColors.has(type)) {
        // Generate a new random color for this payment type
        color = this.generateRandomColor();
        paymentTypeColors.set(type, color);
      } else {
        // Reuse the color if already assigned to this payment type
        color = paymentTypeColors.get(type)!;
      }

      const trace = {
        x: [year],
        y: [record.payment_amount],
        type: 'bar',
        name: type,
        marker: {
          color: type === "Total Revenues" ? 'rgba(169, 169, 169, 0.7)' : color
        },
        text: `Year: ${year}, Payment: ${record.payment_amount}, Type: ${type}`,
        hoverinfo: 'text',
        showlegend: type !== "Total Revenues" // Don't show Total Revenues in the legend
      };

      if (type === "Total Revenues") {
        totalRevenuesTraces.push(trace);
      } else {
        otherTraces.push(trace);
      }
    });
  });

  // Combine the traces and sort by payment amount in descending order
  let traces = [...totalRevenuesTraces, ...otherTraces];
  traces.sort((a, b) => b.y[0] - a.y[0]);

  const layout = {
    height: 600,
    autosize: true,
    title: 'Payment Amounts Over Years',
    xaxis: { title: 'Year' },
    yaxis: {
      title: 'Payment Amount (in thousands)',
      tickformat: ',d',
      type: 'linear',
      rangemode: 'tozero',
      range: [0, Math.ceil(Math.max(...traces.map(trace => trace.y[0])) / 10000) * 10000]
    },
    barmode: 'overlay', // Keep barmode as 'overlay'
  };

  Plotly.newPlot('myDiv', traces, layout);
}

generateRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}









  confirmAction(message: string, action: () => void): void {
    const confirmDialog = confirm(message);
    if (confirmDialog) {
      action();
    }
  }




  undoUpdatePayment(item: any,comment: string): void {
    this.confirmAction('Are you sure you want to revert the payment to Unknown?', () => {
      this.paymentConnection.undoUpdatePayment(item.id, comment).subscribe(
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
        console.log('Data received from backend:', data);

        // Filtered based on both licensor and known licensee conditions
        this.filteredMultiplePayments = data.filter(item => {
          const meetsLicensorCondition = item.licensor === this.licensorName;
          const meetsLicenseeCondition = item.indiv_licensee === this.licenseeName;
          return meetsLicensorCondition && meetsLicenseeCondition;
        });

        console.log('Filtered multiple Pa:', this.filteredMultiplePayments);

        // Filtered based on licensor only
        const confirmedTableRows = this.filteredMultiplePayments.map(item => item.id);
        this.multiplePayments = data.filter(item => !confirmedTableRows.includes(item.id) && item.licensor === this.licensorName);

        console.log('Multiple licenses:', this.multiplePayments);

        // Filter for licenseeName only
        const matchingRowsLicenseeOnly = data.filter(item => item.indiv_licensee === this.licenseeName);
        console.log('Matching rows for licensee only:', matchingRowsLicenseeOnly);

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








  openFeedbackAfterUndoPayment(item: AnimationPlaybackEvent): void {
    const dialogRef = this.dialog.open(FeedbackPopupComponent, {
      data: { item: item } // Pass item or any other data you need
    });

    dialogRef.afterClosed().subscribe(comment => {
      console.log('The dialog was closed');
      console.log('Feedback comment:', comment); // Handle feedback comment here if needed
      if (comment) {
        // If comment is not empty, proceed with undo action passing the comment
        this.undoUpdatePayment(item, comment);
      }
    });
  }


  openFeedbackAfterUndoMP(item: any): void {

        // If comment is not empty, proceed with undo action passing the comment
        this.undoUpdateMP(item);

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
        this.updateMultiplePayments(item, comment); // Pass the comment here
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

  saveMPDetails(item: any): void {
    this.paymentConnection.updateMPDetails(item.id, item.updatedDetails).subscribe(
      (response) =>  {
        console.log('Details updated successfully:', response);
        window.alert('Details updated successfully');
        item.editing = false;
        this.fetchMultiplePaymentsData();
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



  updateMultiplePayments(item: any, comment: string): void {
    // Check if licenseeName already exists in the licensee string
    const licenseeNames = item.licensee ? item.licensee.split(' | ') : [];
    if (licenseeNames.includes(this.licenseeName)) {
      alert(`${this.licenseeName} already exists in the licensee list.`);
      return;
    }

    // Fetch all rows with the same snippet_id
    const snippetId = item.snippet_id;
    const itemsToUpdate = this.multiplePayments.filter(payment => payment.snippet_id === snippetId);

    if (itemsToUpdate.length === 0) {
      console.error('No rows found with the provided snippet_id.');
      return;
    }

    // Identify the row with the highest ID
    const latestRow = itemsToUpdate.reduce((prev, current) => (prev.id > current.id) ? prev : current);

    // Update the licensee field for all rows
    itemsToUpdate.forEach(itemToUpdate => {
      const currentLicenseeNames = itemToUpdate.licensee ? itemToUpdate.licensee.split(' | ') : [];
      const updatedLicensee = itemToUpdate.licensee
        ? `${itemToUpdate.licensee} | ${this.licenseeName}`
        : this.licenseeName;

      // Ensure no duplicate names exist
      const uniqueLicensees = new Set(updatedLicensee.split(' | '));
      const updatedLicenseeString = Array.from(uniqueLicensees).join(' | ');

      // Decrement the multiplier for the row with id matching modified value
      if (itemToUpdate.id === parseInt(item.modified, 10)) {
        if (itemToUpdate.multiplier > 0) {
          itemToUpdate.multiplier -= 1;
        } else {
          alert(`Multiplier for row ID ${itemToUpdate.id} cannot be less than 0.`);
        }
      }

      // Update the licensee and modified fields
      itemToUpdate.licensee = updatedLicenseeString;
      itemToUpdate.modified = `${itemToUpdate.id}`;

      // Save each updated item to the backend
      this.paymentConnection.updateMultiplePaymentLicensee(itemToUpdate.id, {
        ...itemToUpdate,
        licensee: itemToUpdate.licensee,
        comment: itemToUpdate.comment,
        multiplier: itemToUpdate.multiplier
      }).subscribe(
        (response) => {
          console.log('Payment updated successfully:', response);
        },
        (error) => {
          console.error('Error updating payment:', error);
        }
      );
    });

    // Clone the original row without duplicating the licenseeName
    const updatedLicenseeNames = item.licensee ? item.licensee.split(' | ') : [];
    if (!updatedLicenseeNames.includes(this.licenseeName)) {
      updatedLicenseeNames.push(this.licenseeName);
    }
    const newRowLicenseeString = updatedLicenseeNames.join(' | ');

    const newRow = {
      ...item,
      id: undefined,
      indiv_licensee: this.licenseeName,
      licensee: newRowLicenseeString,
      modified: `${item.id}`,
      comment: comment,  // Add the comment to the new row
      multiplier: 0  // Set multiplier to 0 for the new row
    };

    // Save the new row to the backend
    this.paymentConnection.createMultiplePayment(newRow).subscribe(
      (response) => {
        console.log('New payment row created successfully:', response);
        this.fetchMultiplePaymentsData();
      },
      (error) => {
        console.error('Error creating new payment row:', error);
      }
    );
  }


  undoUpdateMP(item: any): void {
    this.confirmAction('Are you sure you want to revert the modification?', () => {
      if (!item.modified) {
        console.error('Item modified field is missing.');
        return;
      }

      const originalId = parseInt(item.modified, 10);

      if (isNaN(originalId)) {
        console.error('Failed to parse original ID from modified field:', item.modified);
        return;
      }

      console.log('Original ID extracted from modified field:', originalId);

      // Find the row with the ID extracted from the modified field
      const originalRow = this.multiplePayments.find(payment => payment.id === originalId);

      if (originalRow) {
        // Increment the multiplier of the identified original row by 1 if it's not null
        if (originalRow.multiplier !== null) {
          originalRow.multiplier += 1;

          console.log(`Updating original row id: ${originalRow.id} with new multiplier: ${originalRow.multiplier}`);

          // Create a new object without the comment field
          const { comment, ...originalRowWithoutComment } = originalRow;

          // Save the updated original row
          this.paymentConnection.updateMultiplePaymentLicensee(originalRow.id, originalRowWithoutComment).subscribe(
            (updateResponse) => {
              console.log('Original row multiplier updated successfully:', updateResponse);

              // Proceed with updating the other rows
              const rowsToUpdate = this.multiplePayments.filter(payment => payment.snippet_id === item.snippet_id);

              // Track the number of rows processed
              let rowsProcessed = 0;

              rowsToUpdate.forEach((row) => {
                // Remove the licenseeName from the licensee field
                const licensees = row.licensee.split(' | ').filter((name: string) => name !== this.licenseeName);
                row.licensee = licensees.join(' | ');

                // Create a new object without the comment field
                const { comment: rowComment, ...rowWithoutComment } = row;

                // Update each row in the backend
                this.paymentConnection.updateMultiplePaymentLicensee(row.id, rowWithoutComment).subscribe(
                  (updateResponse) => {
                    console.log('Row updated successfully:', updateResponse);
                    rowsProcessed++;

                    // Check if all rows have been processed
                    if (rowsProcessed === rowsToUpdate.length) {
                      // Delete the new row
                      this.paymentConnection.deleteMultiplePayment(item.id).subscribe(
                        (deleteResponse) => {
                          console.log('New payment row deleted successfully:', deleteResponse);
                          // Refresh the data after all updates and deletion
                          this.fetchMultiplePaymentsData();
                        },
                        (deleteError) => {
                          console.error('Error deleting new payment row:', deleteError);
                        }
                      );
                    }
                  },
                  (error) => {
                    console.error('Error updating row:', error);
                  }
                );
              });
            },
            (error) => {
              console.error('Error updating original row multiplier:', error);
            }
          );
        } else {
          console.error('Multiplier is null for the original row with id:', originalId);
        }
      } else {
        console.error('No original row found with the provided ID to update the multiplier.');
      }
    });
  }



maxCounter: number = 0; // Class-level variable to store the maximum counter value
mappingIdCounter: Map<number, number> = new Map();

uniqueMappingIds: string[] = [];


AddMappingId(itemId: number, item: any, tableType: 'payments' | 'multiplePayments', useMPMappingId: boolean = false): void {
  console.log('AddMappingId function called for table:', tableType);

  const selectedMappingId = item.selectedMappingId;

  if (!selectedMappingId) {
    let licensee = '';
    let licensor = '';

    // Check if the table is multiplePayments and indiv_licensee exists
    if (tableType === 'multiplePayments' && item.indiv_licensee) {
      licensee = item.indiv_licensee;
    } else if (item.licensee) { // Otherwise, use licensee
      licensee = item.licensee;
    }

    // Check if licensor exists
    if (item.licensor) {
      licensor = item.licensor;
    }

    // Ensure both licensee and licensor are present
    if (licensee && licensor) {
      const licenseeFirstThreeLetters = licensee.substring(0, 3).toUpperCase();
      const licensorFirstThreeLetters = licensor.substring(0, 3).toUpperCase();

      // Increment the counter and generate the mapping ID
      this.maxCounter += 1;
      let generatedMappingId = `${licensorFirstThreeLetters}-${licenseeFirstThreeLetters}-${this.maxCounter}`;

      // Ensure the generated mapping ID is unique
      while (this.uniqueMappingIds.includes(generatedMappingId)) {
        this.maxCounter += 1;
        generatedMappingId = `${licensorFirstThreeLetters}-${licenseeFirstThreeLetters}-${this.maxCounter}`;
      }

      item.mapping_id = generatedMappingId;
      this.uniqueMappingIds.push(generatedMappingId);
      this.updateMappingId(itemId, generatedMappingId, tableType, useMPMappingId);
      this.mappingIdCounter.set(itemId, this.maxCounter);
    } else {
      console.error('No licensee or licensor found.');
      window.alert('Licensee or Licensor information is missing.');
    }
  } else {
    // If a mapping ID is already selected, update without generating a new one
    this.updateMappingId(itemId, selectedMappingId, tableType, useMPMappingId);
  }
}
updateMappingId(itemId: number, mappingId: string, tableType: 'payments' | 'multiplePayments', useMappingId: boolean): void {
  let updateObservable;

  if (tableType === 'multiplePayments') {
    updateObservable = useMappingId ?
      this.paymentConnection.updateMPMappingId(itemId, mappingId) :
      this.paymentConnection.updateMPMappingId(itemId, mappingId); // Use updateMLMappingId for multipleLicenses
  } else {
    updateObservable = useMappingId ?
      this.paymentConnection.updatePaymentMappingId(itemId, mappingId) :
      this.paymentConnection.updatePaymentMappingId(itemId, mappingId); // Use updateLicenseMappingId for licenses
  }

  updateObservable.subscribe(
    response => {
      console.log('Mapping ID updated successfully:', response);
      // Call the appropriate method to fetch updated data
      if (tableType === 'multiplePayments') {
        this.fetchMultiplePaymentsData();
      } else {
        this.fetchPaymentsData();
      }
    },
    error => {
      console.error('Error updating mapping ID:', error);
      window.alert('Error updating Mapping ID. Please try again.');
    }
  );
}


fetchLicensesMappingIds(): void {
  this.connectionservice.getLicensesMappingIds().subscribe(
    (data: string[]) => {
      this.licensesMappingIds = data;
      console.log("mapping ids : ",data )
    },
    error => {
      console.error('Error fetching mapping IDs:', error);
    }
  );
}


retrieveFilteredMappingIds(): void {
  this.connectionservice.getData().subscribe(
    (data: any[]) => {
      // Extract unique mapping IDs from the data array
      const uniqueMappingIds = [...new Set(data.map(item => item.mapping_id))];
      this.uniqueMappingIds = uniqueMappingIds;
    },
    (error: any) => {
      console.error('Error fetching mapping IDs:', error);
    }
  );
}

populateUniqueMappingIds(): Observable<any[]> {
  return this.connectionservice.getData().pipe(
    tap((data: any[]) => {
      const uniqueMappingIds = [...new Set(data.map(item => item.mapping_id))]
        .filter(mappingId => !!mappingId)
        .filter((value, index, self) => self.indexOf(value) === index);

      console.log('Unique Mapping IDs:', uniqueMappingIds);
    }),
    catchError((error: any) => {
      console.error('Error fetching mapping IDs:', error);
      return throwError(error);
    }),
    mapTo([]) // Map the emitted value to an empty array, as we're returning Observable<any[]>
  );
}

filterMappingIds(item: any, tableType: 'payments' | 'multiplePayments'): string[] {
  if (tableType === 'payments') {
    // Logic for filtering mapping IDs for licenses
    const licensorInitials = item.licensor?.substring(0, 3).toUpperCase();
    const licenseeInitials = item.licensee?.substring(0, 3).toUpperCase();

    return this.uniqueMappingIds.filter(mappingId => {
      const parts = mappingId?.split('-'); // Add null check here
      return (
        parts?.length === 3 &&
        parts[0] === licensorInitials &&
        parts[1] === licenseeInitials
      );
    });
  } else if (tableType === 'multiplePayments') {
    // Logic for filtering mapping IDs for multiple licenses
    // Adjust the filtering logic based on the structure of your multiple licenses data
    // Example:
    const licenseeInitials = item.indiv_licensee?.substring(0, 3).toUpperCase();
    return this.uniqueMappingIds.filter(mappingId => {
      const parts = mappingId?.split('-'); // Add null check here
      return (
        parts?.length === 3 &&
        parts[1] === licenseeInitials
      );
    });
  } else {
    return [];
  }
}

deleteMappingId(id: number): void {
  this.paymentConnection.deleteMappingId(id).subscribe(
    () => {
      console.log('Mapping ID deleted successfully');

      this.fetchPaymentsData();
    },
    error => {
      console.error('Error deleting mapping ID:', error);
      // Handle error appropriately, e.g., show an error message to the user
    }
  );
}
deleteMPMappingId(id: number): void {
  this.paymentConnection.deleteMPMappingId(id).subscribe(
    () => {
      console.log('Mapping ID deleted successfully');

      // Fetch data after successful deletion
      this.fetchMultiplePaymentsData();
    },
    error => {
      console.error('Error deleting mapping ID:', error);
      // Handle error appropriately, e.g., show an error message to the user
    }
  );
}


}