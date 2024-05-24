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
  uniqueMappingIds: string[] = [];


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
    }, 1000);
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

  toggleDetailsVisibility(item: any) {
    item.showDetails = !item.showDetails;
    item.showButtonLabel = item.showDetails ? 'Hide' : 'Show';
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

    let {data, layout, config} = {
      'data': [
          {
              'marker': {
                  'color': 'white'
              },
              'name': '',
              'showlegend': false,
              'x': [
                  '2017-01-01',
                  '2017-02-02'
              ],
              'y': [
                  3,
                  3
              ],
              'type': 'scatter',
              'uid': 'c249743a-db89-442f-aabb-fc6117be6660'
          },
          {
              'marker': {
                  'color': 'white'
              },
              'name': '',
              'showlegend': false,
              'x': [
                  '2017-02-15',
                  '2017-03-15'
              ],
              'y': [
                  3,
                  3
              ],
              'type': 'scatter',
              'uid': 'cdd772d3-35ed-4080-aace-52abf5f5f73a'
          },
          {
              'marker': {
                  'color': 'white'
              },
              'name': '',
              'showlegend': false,
              'x': [
                  '2017-01-17',
                  '2017-02-17'
              ],
              'y': [
                  2,
                  2
              ],
              'type': 'scatter',
              'uid': 'e6725fd1-c7b9-4cef-8779-b68dcbc0bbb9'
          },
          {
              'marker': {
                  'color': 'white'
              },
              'name': '',
              'showlegend': false,
              'x': [
                  '2017-01-17',
                  '2017-02-17'
              ],
              'y': [
                  2,
                  2
              ],
              'type': 'scatter',
              'uid': 'fa5c840a-a2fe-4a09-928b-693034b034b1'
          },
          {
              'marker': {
                  'color': 'white'
              },
              'name': '',
              'showlegend': false,
              'x': [
                  '2017-03-10',
                  '2017-03-20'
              ],
              'y': [
                  1,
                  1
              ],
              'type': 'scatter',
              'uid': '6591aa19-6fe0-47ea-afce-0bc882bd2cc5'
          },
          {
              'marker': {
                  'color': 'white'
              },
              'name': '',
              'showlegend': false,
              'x': [
                  '2017-04-01',
                  '2017-04-20'
              ],
              'y': [
                  1,
                  1
              ],
              'type': 'scatter',
              'uid': 'e18ffc2b-72fb-4858-a0b6-7baae6a76870'
          },
          {
              'marker': {
                  'color': 'white'
              },
              'name': '',
              'showlegend': false,
              'x': [
                  '2017-05-18',
                  '2017-06-18'
              ],
              'y': [
                  1,
                  1
              ],
              'type': 'scatter',
              'uid': 'ff9b45a3-de8d-44e7-b148-f4d3c95a33c1'
          },
          {
              'marker': {
                  'color': 'white'
              },
              'name': '',
              'showlegend': false,
              'x': [
                  '2017-01-14',
                  '2017-03-14'
              ],
              'y': [
                  0,
                  0
              ],
              'type': 'scatter',
              'uid': '7f9edd3f-cb1d-4a5e-8083-270fb3a17a41'
          },
          {
              'hoverinfo': 'none',
              'marker': {
                  'color': 'rgb(0, 255, 100)',
                  'size': 1
              },
              'name': 'Existing license',
              'showlegend': true,
              'x': [
                  '2017-01-14',
                  '2017-01-14'
              ],
              'y': [
                  0,
                  0
              ],
              'type': 'scatter',
              'uid': '2995afea-42d5-4f5c-a882-9a093a2ec189'
          },
          {
              'hoverinfo': 'none',
              'marker': {
                  'color': 'rgb(255, 230, 41)',
                  'size': 1
              },
              'name': 'Expired License',
              'showlegend': true,
              'x': [
                  '2017-01-14',
                  '2017-01-14'
              ],
              'y': [
                  1,
                  1
              ],
              'type': 'scatter',
              'uid': 'ed7fac13-428a-4ecd-af0a-02984d8ab28a'
          },
          {
              'hoverinfo': 'none',
              'marker': {
                  'color': 'rgb(220, 0, 0)',
                  'size': 1
              },
              'name': 'Doesnt Exist',
              'showlegend': true,
              'x': [
                  '2017-01-14',
                  '2017-01-14'
              ],
              'y': [
                  2,
                  2
              ],
              'type': 'scatter',
              'uid': '37f8896d-3f6a-47da-9fa5-ce98035c1658'
          }
      ],
      'layout': {
          'height': 600,
          'hovermode': 'closest',
          'shapes': [
              {
                  'fillcolor': 'rgb(0, 255, 100)',
                  'line': {
                      'width': 0
                  },
                  'opacity': 1,
                  'type': 'rect',
                  'x0': '2017-01-01',
                  'x1': '2017-02-02',
                  'xref': 'x',
                  'y0': 2.8,
                  'y1': 3.2,
                  'yref': 'y'
              },
              {
                  'fillcolor': 'rgb(255, 230, 41)',
                  'line': {
                      'width': 0
                  },
                  'opacity': 1,
                  'type': 'rect',
                  'x0': '2017-02-15',
                  'x1': '2017-03-15',
                  'xref': 'x',
                  'y0': 2.8,
                  'y1': 3.2,
                  'yref': 'y'
              },
              {
                  'fillcolor': 'rgb(220, 0, 0)',
                  'line': {
                      'width': 0
                  },
                  'opacity': 1,
                  'type': 'rect',
                  'x0': '2017-01-17',
                  'x1': '2017-02-17',
                  'xref': 'x',
                  'y0': 1.8,
                  'y1': 2.2,
                  'yref': 'y'
              },
              {
                  'fillcolor': 'rgb(0, 255, 100)',
                  'line': {
                      'width': 0
                  },
                  'opacity': 1,
                  'type': 'rect',
                  'x0': '2017-01-17',
                  'x1': '2017-02-17',
                  'xref': 'x',
                  'y0': 1.8,
                  'y1': 2.2,
                  'yref': 'y'
              },
              {
                  'fillcolor': 'rgb(220, 0, 0)',
                  'line': {
                      'width': 0
                  },
                  'opacity': 1,
                  'type': 'rect',
                  'x0': '2017-03-10',
                  'x1': '2017-03-20',
                  'xref': 'x',
                  'y0': 0.8,
                  'y1': 1.2,
                  'yref': 'y'
              },
              {
                  'fillcolor': 'rgb(220, 0, 0)',
                  'line': {
                      'width': 0
                  },
                  'opacity': 1,
                  'type': 'rect',
                  'x0': '2017-04-01',
                  'x1': '2017-04-20',
                  'xref': 'x',
                  'y0': 0.8,
                  'y1': 1.2,
                  'yref': 'y'
              },
              {
                  'fillcolor': 'rgb(220, 0, 0)',
                  'line': {
                      'width': 0
                  },
                  'opacity': 1,
                  'type': 'rect',
                  'x0': '2017-05-18',
                  'x1': '2017-06-18',
                  'xref': 'x',
                  'y0': 0.8,
                  'y1': 1.2,
                  'yref': 'y'
              },
              {
                  'fillcolor': 'rgb(0, 255, 100)',
                  'line': {
                      'width': 0
                  },
                  'opacity': 1,
                  'type': 'rect',
                  'x0': '2017-01-14',
                  'x1': '2017-03-14',
                  'xref': 'x',
                  'y0': -0.2,
                  'y1': 0.2,
                  'yref': 'y'
              }
          ],
          'showlegend': true,
          'title': {
              'text': 'Timeline (in progress)'
          },
          'width': 900,
          'xaxis': {
              'rangeselector': {
                  'buttons': [
                      {
                          'count': 7,
                          'label': '1w',
                          'step': 'day',
                          'stepmode': 'backward'
                      },
                      {
                          'count': 1,
                          'label': '1m',
                          'step': 'month',
                          'stepmode': 'backward'
                      },
                      {
                          'count': 6,
                          'label': '6m',
                          'step': 'month',
                          'stepmode': 'backward'
                      },
                      {
                          'count': 1,
                          'label': 'YTD',
                          'step': 'year',
                          'stepmode': 'todate'
                      },
                      {
                          'count': 1,
                          'label': '1y',
                          'step': 'year',
                          'stepmode': 'backward'
                      },
                      {
                          'step': 'all'
                      }
                  ]
              },
              'showgrid': false,
              'type': 'date',
              'zeroline': false
          },
          'yaxis': {
              'autorange': false,
              'range': [
                  -1,
                  5
              ],
              'showgrid': false,
              'ticktext': [
                  '2G',
                  '3G',
                  '4G',
                  '5G',
                  '6G',
                  'wifi',
                  ''
              ],
              'tickvals': [
                  0,
                  1,
                  2,
                  3,
                  4,
                  5,
                  6
              ],
              'zeroline': false
          }
      },
      'config': {
          'showLink': false,
          'linkText': 'Export to plot.ly',
          'plotlyServerURL': 'https://plot.ly'
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
      console.log('Data received from backend:', data);

      // Filtered based on both licensor and known licensee conditions
      this.filteredMultipleLicenses = data.filter(item => {
        const meetsLicensorCondition = item.licensor === this.licensorName;
        const meetsLicenseeCondition = item.indiv_licensee === this.licenseeName;
        return meetsLicensorCondition && meetsLicenseeCondition;
      });

      console.log('Filtered multiple licenses:', this.filteredMultipleLicenses);

      // Filtered based on licensor only
      const confirmedTableRows = this.filteredMultipleLicenses.map(item => item.id);
      this.multipleLicenses = data.filter(item => !confirmedTableRows.includes(item.id) && item.licensor === this.licensorName);

      console.log('Multiple licenses:', this.multipleLicenses);

      // Filter for licenseeName only
      const matchingRowsLicenseeOnly = data.filter(item => item.indiv_licensee === this.licenseeName);
      console.log('Matching rows for licensee only:', matchingRowsLicenseeOnly);

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
    // Check if licenseeName already exists in the licensee string
    const licenseeNames = item.licensee ? item.licensee.split(' | ') : [];
    if (licenseeNames.includes(this.licenseeName)) {
      alert(`${this.licenseeName} already exists in the licensee list.`);
      return;
    }
  
    // Fetch all rows with the same snippet_id
    const snippetId = item.snippet_id;
    const itemsToUpdate = this.multipleLicenses.filter(license => license.snippet_id === snippetId);
  
    // Iterate through each item and update the licensee field
    itemsToUpdate.forEach(itemToUpdate => {
      const currentLicenseeNames = itemToUpdate.licensee ? itemToUpdate.licensee.split(' | ') : [];
      // Concatenate this.licenseeName to the existing licensee value, separated by " | "
      const updatedLicensee = itemToUpdate.licensee
        ? `${itemToUpdate.licensee} | ${this.licenseeName}`
        : this.licenseeName;
  
      // Ensure no duplicate names exist
      const uniqueLicensees = new Set(updatedLicensee.split(' | '));
      const updatedLicenseeString = Array.from(uniqueLicensees).join(' | ');
  
      // Update the licensee and modified fields
      itemToUpdate.licensee = updatedLicenseeString;
      itemToUpdate.modified = `${itemToUpdate.snippet_id}_${itemToUpdate.id}`;
    });
  
    // Save each updated item to the backend
    itemsToUpdate.forEach(itemToUpdate => {
      this.connectionService.updateMultipleLicensee(itemToUpdate.id, { ...itemToUpdate, licensee: itemToUpdate.licensee }, comment)
        .subscribe(
          (response) => {
            console.log('License updated successfully:', response);
            this.fetchMultipleLicensesData();
          },
          (error) => {
            console.error('Error updating license:', error);
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
      modified: `${item.snippet_id}_${item.id}`
    };
  
    // Save the new row to the backend
    this.connectionService.createMultipleLicensee(newRow).subscribe(
      (response) => {
        console.log('New license row created successfully:', response);
        this.fetchMultipleLicensesData();
      },
      (error) => {
        console.error('Error creating new license row:', error);
      }
    );
  }
  
  
  
  
  



undoUpdateML(item: any, comment: string): void {
  this.confirmAction('Are you sure you want to revert the modification?', () => {
    const snippetId = item.snippet_id;

    // Find all rows with the same snippet_id
    const rowsToUpdate = this.multipleLicenses.filter(license => license.snippet_id === snippetId);

    if (rowsToUpdate.length > 0) {
      // Track the number of rows processed
      let rowsProcessed = 0;

      // Iterate through each row to update the licensee fields
      rowsToUpdate.forEach((row) => {
        // Remove the licenseeName from the licensee field
        const licensees = row.licensee.split(' | ').filter((name: string) => name !== this.licenseeName);
        row.licensee = licensees.join(' | ');

        // Update each row in the backend
        this.connectionService.updateMultipleLicensee(row.id, row, comment).subscribe(
          (response) => {
            console.log('Row updated successfully:', response);
            rowsProcessed++;

            // Check if all rows have been processed
            if (rowsProcessed === rowsToUpdate.length) {
              // Delete the new row
              this.connectionService.deleteMultiplePayment(item.id).subscribe(
                (deleteResponse) => {
                  console.log('New payment row deleted successfully:', deleteResponse);
                  // Refresh the data after all updates and deletion
                  this.fetchMultipleLicensesData();
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
    } else {
      console.error('No rows found with the provided snippet_id.');
    }
  });
}

    
  


openFeedbackAfterUndoML(item: AnimationPlaybackEvent): void {
  const dialogRef = this.dialog.open(FeedbackPopupComponent, {
    data: { item: item } // Pass item or any other data you need
  });

  dialogRef.afterClosed().subscribe(comment => {
    console.log('The dialog was closed');
    console.log('Feedback comment:', comment); // Handle feedback comment here if needed
    if (comment) {
      // If comment is not empty, proceed with undo action passing the comment
      this.undoUpdateML(item, comment);
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



maxCounter: number = 0; // Class-level variable to store the maximum counter value
mappingIdCounter: Map<number, number> = new Map();

AddMappingId(itemId: number, item: any, tableType: 'licenses' | 'multipleLicenses', useMPMappingId: boolean = false): void {
  console.log('AddMappingId function called for table:', tableType);

  const selectedMappingId = item.selectedMappingId;

  if (!selectedMappingId) {
    let licensee = '';
    let licensor = '';

    // Check if the table is multipleLicenses and indiv_licensee exists
    if (tableType === 'multipleLicenses' && item.indiv_licensee) {
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
      this.uniqueMappingIds.push(generatedMappingId); // Add the generated ID to the list of unique IDs
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

updateMappingId(itemId: number, mappingId: string, tableType: 'licenses' | 'multipleLicenses', useMappingId: boolean): void {
  let updateObservable;

  if (tableType === 'multipleLicenses') {
    updateObservable = useMappingId ?
      this.connectionService.updateMLMappingId(itemId, mappingId) :
      this.connectionService.updateMLMappingId(itemId, mappingId); // Use updateMLMappingId for multipleLicenses
  } else {
    updateObservable = useMappingId ?
      this.connectionService.updateLicenseMappingId(itemId, mappingId) :
      this.connectionService.updateLicenseMappingId(itemId, mappingId); // Use updateLicenseMappingId for licenses
  }

  updateObservable.subscribe(
    response => {
      console.log('Mapping ID updated successfully:', response);
      // Call the appropriate method to fetch updated data
      if (tableType === 'multipleLicenses') {
        this.fetchMultipleLicensesData();
      } else {
        this.fetchLicenseData();
      }
    },
    error => {
      console.error('Error updating mapping ID:', error);
      window.alert('Error updating Mapping ID. Please try again.');
    }
  );
}


filterMappingIds(item: any, tableType: 'licenses' | 'multipleLicenses'): string[] {
  if (tableType === 'licenses') {
    // Logic for filtering mapping IDs for licenses
    const licensorInitials = item.licensor.substring(0, 3).toUpperCase();
    const licenseeInitials = item.licensee.substring(0, 3).toUpperCase();

    return this.uniqueMappingIds.filter(mappingId => {
      const parts = mappingId.split('-');
      return (
        parts.length === 3 &&
        parts[0] === licensorInitials &&
        parts[1] === licenseeInitials
      );
    });
  } else if (tableType === 'multipleLicenses') {
    // Logic for filtering mapping IDs for multiple licenses
    // Adjust the filtering logic based on the structure of your multiple licenses data
    // Example:
    const licenseeInitials = item.indiv_licensee.substring(0, 3).toUpperCase();
    return this.uniqueMappingIds.filter(mappingId => {
      const parts = mappingId.split('-');
      return (
        parts.length === 3 &&
        parts[1] === licenseeInitials
      );
    });
  } else {
    return [];
  }
}



}

  
  
  
  
  

  
