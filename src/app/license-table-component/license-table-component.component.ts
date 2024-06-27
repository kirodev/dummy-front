import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ConnectionService } from '../connection.service';
import { HttpClient } from '@angular/common/http';
import { ExamplePdfViewerComponent } from '../example-pdf-viewer/example-pdf-viewer.component';
import { FeedbackPopupComponent } from '../feedback-popup/feedback-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable, forkJoin, map, of } from 'rxjs';
import { TimelineService } from '../timeline-service.service';
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
  filteredTimelineData: any[] = []; 


  constructor(private connectionService: ConnectionService, private http: HttpClient,private dialog: MatDialog,private timelineConnection : TimelineService) {}

  ngOnInit(): void {
    this.licensorName = localStorage.getItem('licensorName') || 'Licensor Name';
    this.licenseeName = localStorage.getItem('licenseeName') || 'licenseeName';
    this.dynamicTitle = `${this.licensorName} vs ${this.licenseeName}`;
    this.fetchLicenseData();
    this.fetchTimelineData();
    this.fetchMultipleLicensesData();
    this.fetchDistinctLicenses(); 
    this.populateUniqueMappingIds(); 
    this.loadPlotlyScript().then(() => {
      console.log('Plotly.js script loaded successfully');
      this.fetchTimelineData();
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

  deleteLicense(id: any): void {
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


  deleteMultipleLicenses(id: any): void {
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
        this.fetchLicenseData();
      },
      (error) => {
        console.error('Error updating details:', error);
      }
    );
  }
  saveMLDetails(item: any): void {
    this.connectionService.updateMLDetails(item.id, item.updatedDetails).subscribe(
      (response) =>  {
        console.log('Details updated successfully:', response);
        window.alert('Details updated successfully');
        item.editing = false; 
        this.fetchMultipleLicensesData();
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
  timelineData: any[] = [];


fetchTimelineData(): void {
  this.timelineConnection.getTimelineData().subscribe(
    (data: any[]) => {
      console.log("Fetched Timeline Data:", data); // Print fetched data
      this.timelineData = data;
      this.filteredTimelineData = this.timelineData.filter(
        item => item.licensor === this.licensorName && item.licensee === this.licenseeName
      );
      console.log("Filtered Timeline Data:", this.filteredTimelineData); // Print filtered data
      this.plotData(); // <-- Plot the data after fetching
    },
    (error) => {
      console.error('Error fetching data:', error);
    }
  );
}
plotData(): void {
  const data: any[] = [];
  const date_types: string[] = [];
  const staticColors: string[] = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

  // Iterate over the filteredTimelineData array
  for (const item of this.filteredTimelineData) {
    const id = item.id;
    const start = item.signed_date;
    const end = item.expiration_date;
    const date_type: string = item.date_type || 'Unknown'; // Default to 'Unknown' if date_type is null or undefined

    if (!date_types.includes(date_type)) {
      date_types.push(date_type);
    }

    const date_type_index: number = date_types.indexOf(date_type);

    // Check the technologies values
    const technologies: boolean[] = [
      item._2G === 'Y',
      item._3G === 'Y',
      item._4G === 'Y',
      item._5G === 'Y',
      item._6G === 'Y',
      item.wifi === 'Y',
    ];

    // Check if the item is for the "Total" category
    const isTotal: boolean = technologies.some(tech => tech) || Object.keys(item).slice(9).every(key => item[key] === null || item[key] === '');

    if (isTotal) {
      if (start && end) {
        const totalTrace = {
          x: [start, end], // X values from start to end
          y: [6, 6], // Y values for "Total" category
          line: {
            color: staticColors[date_type_index % staticColors.length], // Use static color for each date_type
          },
          name: `${date_type}_${id}_Total`, // Use date_type and index as the name
          showlegend: true,
          type: 'scatter',
        };
        data.push(totalTrace);
      }

      // If start or end date is missing, add a marker
      if (!start || !end) {
        const markerTrace = {
          x: [start || end], // Place the marker at the existing date
          y: [6], // Assuming y-axis index 6 for "Total" category
          mode: 'markers',
          name: `${date_type}_${id}`, // Use date_type and index as the name
          marker: {
            symbol: 'circle',
            size: 10,
            color: staticColors[date_type_index % staticColors.length], // Use static color for each date_type
          },
          showlegend: true,
        };
        data.push(markerTrace);
      }
    }

    // Traces for individual technologies
    console.log(`ID: ${id}, Technologies:`, technologies);

    for (let i = 0; i < technologies.length; i++) {
      if (technologies[i]) {
        const knownTrace = {
          marker: {
            color: staticColors[date_type_index % staticColors.length], // Use static color for each date_type
          },
          name: `${date_type}_${id}_${i}`, // Use date_type and index as the name
          showlegend: true,
          x: [start, end],
          y: [i, i], // Set y to [i, i] for individual technologies
          type: 'scatter',
        };
        data.push(knownTrace);
      }
    }
  }

  const layout: any = {
    height: 600,
    autosize: true,
    hovermode: 'closest',
    showlegend: true,
    title: {
      text: 'Timeline',
    },
    xaxis: {
      rangeselector: {
        buttons: [
          {
            count: 7,
            label: '1w',
            step: 'day',
            stepmode: 'backward',
          },
          {
            count: 1,
            label: '1m',
            step: 'month',
            stepmode: 'backward',
          },
          {
            count: 6,
            label: '6m',
            step: 'month',
            stepmode: 'backward',
          },
          {
            count: 1,
            label: 'YTD',
            step: 'year',
            stepmode: 'todate',
          },
          {
            count: 1,
            label: '1y',
            step: 'year',
            stepmode: 'backward',
          },
          {
            step: 'all',
          },
        ],
      },
      showgrid: false,
      type: 'date',
      zeroline: false,
    },
    yaxis: {
      autorange: false,
      range: [-1, 7],
      showgrid: false,
      ticktext: ['2G', '3G', '4G', '5G', '6G', 'WIFI', 'Total'],
      tickvals: [0, 1, 2, 3, 4, 5, 6],
      zeroline: false,
    },
  };

  const config: any = {
    showLink: false,
    linkText: 'Export to plot.ly',
    plotlyServerURL: 'https://plot.ly',
  };

  Plotly.newPlot('myDiv', data, layout, config);
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
    // Fetch mapping IDs from "licenses" table
    const licensesMappingIds$ = this.connectionService.getData().pipe(
      map((data: any[]) => {
        return data
          .filter(item => item.mapping_id) // Filter out items with undefined or null mapping_id
          .map(item => item.mapping_id);
      })
    );

    // Fetch mapping IDs from "multipleLicenses" table
    const multipleLicensesMappingIds$ = this.connectionService.getMultipleLicenses().pipe(
      map((data: any[]) => {
        return data
          .filter(item => item.mapping_id) // Filter out items with undefined or null mapping_id
          .map(item => item.mapping_id);
      })
    );

    // Combine mapping IDs from both tables
    forkJoin([licensesMappingIds$, multipleLicensesMappingIds$]).subscribe(
      ([licensesMappingIds, multipleLicensesMappingIds]) => {
        // Merge and filter unique mapping IDs from both tables
        this.uniqueMappingIds = [
          ...new Set([...licensesMappingIds, ...multipleLicensesMappingIds])
        ].filter((value, index, self) => self.indexOf(value) === index);

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


deleteMappingId(id: number): void {
  this.connectionService.deleteMappingId(id).subscribe(
    () => {
      console.log('Mapping ID deleted successfully');
      this.fetchLicenseData();
    },
    error => {
      console.error('Error deleting mapping ID:', error);
      // Handle error appropriately, e.g., show an error message to the user
    }
  );
}
deleteMPMappingId(id: number): void {
  this.connectionService.deleteMPMappingId(id).subscribe(
    () => {
      console.log('Mapping ID deleted successfully');
      
      // Fetch data after successful deletion
      this.fetchMultipleLicensesData();
    },
    error => {
      console.error('Error deleting mapping ID:', error);
      // Handle error appropriately, e.g., show an error message to the user
    }
  );
}


}

  
  
  
  
  

  