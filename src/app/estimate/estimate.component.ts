import { Component, OnInit } from "@angular/core";
import { ConnectionService } from "../connection.service";

@Component({
  selector: 'app-estimate',
  templateUrl: './estimate.component.html',
  styleUrls: ['./estimate.component.css']
})
export class EstimateComponent implements OnInit {
  dynamicTitle: string = '';
  licensorName: string = '';
  licenseeName: string = '';
  licenseData: any[] = [];

  constructor(private connectionService: ConnectionService) { }

  ngOnInit(): void {
    // Retrieve values from Local Storage
    this.licensorName = localStorage.getItem('licensorName') || 'Licensor Name';
    this.licenseeName = localStorage.getItem('licenseeName') || 'licenseeName';

    // Generate dynamicTitle based on retrieved values
    this.dynamicTitle = `${this.licensorName} vs ${this.licenseeName}`;

    // Fetch data from backend
    this.fetchLicenseData();


  }

  fetchLicenseData(): void {
    this.connectionService.getData().subscribe(
      (data: any[]) => {
        this.licenseData = data;

        // Filter data based on dynamicTitle
        this.filterLicenseData();
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  filterLicenseData(): void {
    // Filter data to include items where either licensor or licensee matches dynamicTitle
    this.licenseData = this.licenseData.filter((item) => {
      return item.licensor === this.licenseeName || item.licensee === this.licensorName;
    });
  }

  showPopup(pdfUrl: string, pageNumber: number) {
    // Open a new window or tab
    const popup = window.open('', '', 'width=800,height=600');

    // Check if the popup window was successfully opened
    if (popup) {
      // Construct the PDF URL with the specified page number
      const pdfUrlWithPage = `${pdfUrl}#page=${pageNumber}`;

      // Load the PDF URL in the popup window
      popup.location.href = pdfUrlWithPage;
    }
  }

}
