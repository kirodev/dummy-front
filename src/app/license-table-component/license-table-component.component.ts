import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ConnectionService } from '../connection.service';
import { HttpClient } from '@angular/common/http';
import { ExamplePdfViewerComponent } from '../example-pdf-viewer/example-pdf-viewer.component';
import { FeedbackPopupComponent } from '../feedback-popup/feedback-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';
declare var Plotly: any;

@Component({
  selector: 'app-license-table',
  templateUrl: './license-table-component.component.html',
  styleUrls: ['./license-table-component.component.css']
})
export class LicenseTableComponent implements OnInit {
  @ViewChild(ExamplePdfViewerComponent, { static: false }) pdfViewer!: ExamplePdfViewerComponent;
  @Input() pdfSrc: string = '';

  licenseData: any[] = [];
  filteredDataDefined: any[] = []; 
  filteredDataUnknown: any[] = [];
  dynamicTitle: string = '';
  licensorName: string = '';
  licenseeName: string = '';
  multipleLicenses: any[] = [];
  uniqueLicenses: string[] = [];
  filteredMultipleLicenses: any[] = []; 
  selectedLicense: string = ''; 


  constructor(private connectionService: ConnectionService, private http: HttpClient,private dialog: MatDialog) {}

  ngOnInit(): void {
    this.licensorName = localStorage.getItem('licensorName') || 'Licensor Name';
    this.licenseeName = localStorage.getItem('licenseeName') || 'licenseeName';
    this.dynamicTitle = `${this.licensorName} vs ${this.licenseeName}`;
    this.fetchLicenseData();
    this.fetchMultipleLicensesData();
    this.multipleLicenses;
    this.fetchDistinctLicenses(); 
    this.populateUniqueMappingIds(); 
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
    var trace1 = {
      x: [2013, 2017, 2018,2023],
      y: ['3G', '4G', '5G','WIFI'],
      name: 'Signed IN',
      orientation: 'h',
      marker: {
        color: 'rgba(55,128,191,0.6)',
        width: 1
      },
      type: 'bar'
    };
    
    var trace2 = {
      x: [2013, 2017, 2018,2023],
      y: ['3G', '4G', '5G','WIFI'],
      name: 'Expired In',
      orientation: 'h',
      type: 'bar',
      marker: {
        color: 'rgba(255,153,51,0.6)',
        width: 1
      }
    };
    
    var data = [trace1, trace2];
    
    var layout = {
      title: 'Colored Bar Chart',
      barmode: 'stack'
    };
    
    Plotly.newPlot('myDiv', data, layout);
    
    
      }

  confirmAction(message: string, action: () => void): void {
    const confirmDialog = confirm(message);
    if (confirmDialog) {
      action(); 
    }
  }
  showCommentTooltip(item: any): void {
    item.showComment = true;
  }
  
  hideCommentTooltip(item: any): void {
    item.showComment = false;
  }
  

  updateRow(item: any, comment: string): void {
    console.log('updateLicense method called');
    if (item.licensee === 'Unknown') {
        item.licensee = this.licenseeName; // Assign licenseeName to licensee
        console.log('Before confirmation dialog');
        this.confirmAction('Are you sure you want to update the licensee?', () => {
            console.log('Inside confirmation dialog');
            // Include comment in the request body
            this.connectionService.updateLicense(item.id, item, comment).subscribe(
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
        console.log('Licensee update failed!');
        window.alert('Licensee update failed!');
    }
}

  



  undoUpdateLicense(item: any,comment: string): void {
    this.confirmAction('Are you sure you want to revert the modification?', () => {
      this.connectionService.undoUpdateLicensee(item.id, comment).subscribe(
        (response) => {
          console.log('Modification reverted successfully:', response);
          // After successful revert, fetch updated data if needed
          this.fetchLicenseData();
        },
        (error) => {
          console.error('Error reverting modification:', error);
          window.alert('Error reverting modification');
        }
      );
    });
  }

fetchDistinctLicenses(): void {
  if (this.uniqueLicenses.length === 0) {
    this.connectionService.getData().subscribe(
      (data: any[]) => {
        // Extract unique licensees from the data array
        const uniqueLicensees = [...new Set(data.map(item => item.licensee))];
        this.uniqueLicenses = uniqueLicensees;
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
      },
      (error) => {
        console.error('Error fetching data for multiple licensees:', error);
      }
    );
  }

  
  

 initializeUniqueLicenses(): void {
    const uniqueLicenses = this.multipleLicenses.reduce((acc: string[], curr: any) => {
      if (!acc.includes(curr.licensee)) {
        acc.push(curr.licensee);
      }
      return acc;
    }, []);
    this.uniqueLicenses = uniqueLicenses;
  }







  updateMultipleLicenses(item: any, comment: string): void {
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
  
    // Save the updated license to the backend, including the comment in the request body
    this.connectionService.updateMultipleLicensee(item.id, item, comment).subscribe(
      (response) => {
        console.log('license updated successfully:', response);
        this.fetchMultipleLicensesData();
      },
      (error) => {
        console.error('Error updating license:', error);
      }
    );



}
undoUpdateMultipleLicense(item: any,comment: string): void {
  this.confirmAction('Are you sure you want to revert the modification?', () => {
    this.connectionService.undoUpdateMultipleLicensee(item.id, comment).subscribe(
      (response) => {
        console.log('Modification reverted successfully:', response);
        // After successful revert, fetch updated data if needed
        this.fetchMultipleLicensesData();
      },
      (error) => {
        console.error('Error reverting modification:', error);
        window.alert('Error reverting modification');
      }
    );
  });
}

    
  
openFeedbackAfterUndo(item: AnimationPlaybackEvent): void {
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


openFeedbackAfterUndolicense(item: AnimationPlaybackEvent): void {
  const dialogRef = this.dialog.open(FeedbackPopupComponent, {
    data: { item: item } // Pass item or any other data you need
  });

  dialogRef.afterClosed().subscribe(comment => {
    console.log('The dialog was closed');
    console.log('Feedback comment:', comment); // Handle feedback comment here if needed
    if (comment) {
      // If comment is not empty, proceed with undo action passing the comment
      this.undoUpdateLicense(item, comment);
    }
  });
}

openFeedbackAfterUpdateMultipleLicenses(item: any): void {
  const dialogRef = this.dialog.open(FeedbackPopupComponent, {
    data: { item: item } // Pass the updated license data to the feedback popup
  });

  dialogRef.afterClosed().subscribe(comment => {
    console.log('The dialog was closed');
    console.log('Feedback comment:', comment); // Handle feedback comment here if needed
    if (comment) {
      // If comment is not empty, proceed with update action passing the comment
      this.updateMultipleLicenses(item, comment); // Pass the comment here
    }
  });
}


openFeedbackAfterUpdate(item: any): void {
  const dialogRef = this.dialog.open(FeedbackPopupComponent, {
    data: { item: item } // Pass the updated license data to the feedback popup
  });

  dialogRef.afterClosed().subscribe(comment => {
    console.log('The dialog was closed');
    console.log('Feedback comment:', comment); // Handle feedback comment here if needed
    if (comment) {
      // If comment is not empty, proceed with undo action passing the comment
      this.updateRow(item, comment); // Pass the comment here
    }
  });
}


uniqueMappingIds: string[] = [];

populateUniqueMappingIds(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    this.connectionService.getData().subscribe(
      (data: any[]) => {
        // Assuming the mapping IDs are stored in a property called mapping_id
        this.uniqueMappingIds = data
          .filter(item => item.mapping_id) // Filter out items with undefined or null mapping_id
          .map(item => item.mapping_id)
          .filter((value, index, self) => self.indexOf(value) === index);

        console.log('Unique Mapping IDs:', this.uniqueMappingIds); // Log uniqueMappingIds

        resolve(); // Resolve the promise once unique mapping IDs are populated
      },
      error => {
        console.error('Error fetching mapping IDs:', error);
        reject(error); // Reject the promise if there's an error fetching data
      }
    );
  });
}




// Function to extract the year from the signed date
extractYear(signedDate: string): string {
  let year = '';

  if (signedDate) {
    // Check if the signed date contains a dot (.)
    if (signedDate.includes('.')) {
      // Extract the year from the signed date (assuming it's in the format dd.mm.yyyy)
      const dateParts = signedDate.split('.');
      if (dateParts.length === 3) {
        year = dateParts[2];
      } else {
        console.error('Invalid signed date format:', signedDate);
      }
    } else {
      // Assume the signed date is already in the format yyyy
      year = signedDate;
    }
  } else {
    console.error('No signed date provided.');
  }

  return year;
}



AddMappingId(itemId: number, item: any, signedDate: string): void {
  console.log('AddMappingId function called');

  // Extract the year from the signed date
  const year = this.extractYear(signedDate);

  // Get the selected mapping ID from the dropdown
  const selectedMappingId = item.selectedMappingId;

  // If a mapping ID is selected from the dropdown, update the mapping_id with the selected value
  if (selectedMappingId) {
    item.mapping_id = selectedMappingId;

    // Save the updated item to the backend
    this.connectionService.updateMappingId(itemId, selectedMappingId)
      .subscribe(
        response => {
          console.log('Mapping ID updated successfully:', response);
          // Optionally, you can perform additional actions after successful update
        },
        error => {
          console.error('Error updating mapping ID:', error);
          // Handle error scenarios here
        }
      );
  } else {
    // Generate a new mapping ID using the provided data
    const licensee = item.licensee;
    const licensor = item.licensor;

    if (licensee && licensor) {
      const licenseeFirstLetter = licensee.charAt(0).toUpperCase();
      const licensorFirstLetter = licensor.charAt(0).toUpperCase();

      // Construct the mapping ID using the item's ID, licensee and licensor initials, and the year
      const generatedMappingId = `${itemId}-${licensorFirstLetter}-${licenseeFirstLetter}-${year}`;

      // Assign the generated mapping ID to the item
      item.mapping_id = generatedMappingId;

      // Save the updated item to the backend
      this.connectionService.updateMappingId(itemId, generatedMappingId)
        .subscribe(
          response => {
            console.log('New Mapping ID created and updated successfully:', response);
            // Optionally, you can perform additional actions after successful update
          },
          error => {
            console.error('Error creating new mapping ID:', error);
            // Handle error scenarios here
          }
        );
    } else {
      console.error('No licensee or licensor found.');
      // Handle the scenario where licensee or licensor is missing
    }
  }
}






}

  
  
  
  
  

  
