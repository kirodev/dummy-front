import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ExamplePdfViewerComponent } from '../example-pdf-viewer/example-pdf-viewer.component';
import { PaymentConnection } from '../payment-connection.service';
import { FeedbackPopupComponent } from '../feedback-popup/feedback-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { ConnectionService } from '../connection.service';
import { Observable, throwError, mapTo } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
declare var Plotly: any;

@Component({
  selector: 'app-payment-table',
  templateUrl: './payment-table.component.html',
  styleUrls: ['./payment-table.component.css']
})
export class PaymentTableComponent  implements OnInit, AfterViewInit {
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
  tableData: any[] = [];
  tableColumns: string[] = [];
  groupedTableData: { [year: string]: { primary: any, secondary: any[] } } = {};
  expandedYears: Set<string> = new Set();
  showDetailsMap: Map<string, boolean> = new Map();

  constructor(
    private paymentConnection: PaymentConnection,
    private dialog: MatDialog,
    private connectionservice: ConnectionService
  ) { }

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
    this.prepareTableData();

    this.loadPlotlyScript().then(() => {
      console.log('Plotly.js script loaded successfully');
      this.plotData();
    }).catch(error => {
      console.error('Error loading Plotly.js script:', error);
    });
  }
  ngAfterViewInit(): void {
    if (this.pdfViewer) {
      // Subscribe to the pdfLoaded event
      this.pdfViewer.pdfLoaded.subscribe(() => {
        this.onPdfLoaded();
      });

      // Subscribe to the pageChange event
      this.pdfViewer.pageChange.subscribe((pageNumber: number) => {
        this.onPageChange(pageNumber);
      });
    } else {
      console.error('PDF viewer is not initialized.');
    }
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

  generateCloudinaryUrl(directory_path: string): string {
    let normalizedPath = directory_path.replace(/\\/g, '/');

    if (!normalizedPath.startsWith('Data Library/')) {
      normalizedPath = `Data Library/${normalizedPath}`;
    }

    const pathParts = normalizedPath.split('/');
    const filename = pathParts.pop(); // Extract the filename

    if (!filename) {
      console.error('Invalid directory path, no filename provided.');
      return ''; // Return empty string or handle the error as needed
    }

    // Step 3: Format the filename
    // 3a: Replace [YYYY] with YYYY_
    // 3b: Remove parentheses
    // 3c: Replace spaces with underscores only if there are no adjacent underscores
    const formattedFilename = filename
      .replace(/\[([0-9]{4})\]/g, '$1_')  // Replace [YYYY] with YYYY_
      .replace(/[()]/g, '')               // Remove parentheses
      .replace(/\s+/g, '_')               // Replace spaces with underscores

      // Remove any double underscores that may have been added by accident
      .replace(/_+/g, '_');               // Replace multiple underscores with a single underscore

    // Step 4: Reconstruct the path with the formatted filename
    normalizedPath = [...pathParts, formattedFilename].join('/');

    // Step 5: Encode the folder path to handle spaces correctly (excluding "/")
    normalizedPath = pathParts.map(encodeURIComponent).join('/') + '/' + formattedFilename;

    // Step 6: Construct the Cloudinary URL
    return `https://res.cloudinary.com/himbuyrbv/image/upload/${normalizedPath}`;
  }


  isPopupLoading: boolean = false;


  onPdfLoaded(): void {
    this.isPopupLoading = false; // Stop loading
    console.log('PDF fully loaded!');
    if (this.pdfViewer.searchText) {
      this.pdfViewer.triggerSearch();
    }
  }

  onPageChange(pageNumber: number): void {
    console.log(`Current page number: ${pageNumber}`);
    this.isPopupLoading = true; // Show loading GIF

    // Optionally, hide the loading GIF after a short delay
    setTimeout(() => {
      this.isPopupLoading = false;
    }, 500); // Adjust the delay as needed
  }

  openPDFViewerPopup(directory_path: string, details: string): void {
    const cloudinaryUrl = this.generateCloudinaryUrl(directory_path);
    const url = cloudinaryUrl;  // This now points to the Cloudinary URL

    this.selectedPDF = url;
    this.showPDFViewer = true;
    this.showPopup = true;
    this.isPopupLoading = true; // Start loading

    setTimeout(() => {
      if (this.pdfViewer) {
        this.pdfViewer.searchPDF(details); // Keep the existing functionality for the popup
      }
    }, 500); // Adjust the delay as needed
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

aggregateQuarterlyToYearly(): void {
  const yearlyAggregatedData = new Map<number, { value: number, isComplete: boolean }>();

  // Aggregate quarterly payments from multiple payments
  this.filteredMultiplePayments.forEach(item => {
    const numericYear = parseInt(item.year, 10);

    if (!isNaN(numericYear) && item.eq_type === 'TPQ' && item.licensor === this.licensorName &&
        (item.indiv_licensee === this.licenseeName || item.licensee?.includes(this.licenseeName))) {

      // Initialize yearly entry if it does not exist
      if (!yearlyAggregatedData.has(numericYear)) {
        yearlyAggregatedData.set(numericYear, { value: 0, isComplete: true });
      }

      // Aggregate the quarterly values and check for completeness
      const yearData = yearlyAggregatedData.get(numericYear)!;
      if (typeof item.payment_amount === 'number' && !isNaN(item.payment_amount)) {
        yearData.value += item.payment_amount;
      } else if (typeof item.results === 'number' && !isNaN(item.results)) {
        yearData.value += item.results;
      } else {
        yearData.isComplete = false; // Mark as incomplete if any data is missing
      }

      // Update the yearly data entry
      yearlyAggregatedData.set(numericYear, yearData);
    }
  });

  // Perform similar aggregation on the payments data (with 'licensee' field)
  this.paymentData.forEach(item => {
    const numericYear = parseInt(item.year, 10);

    if (!isNaN(numericYear) && item.eq_type === 'TPQ' && item.licensor === this.licensorName &&
        item.licensee === this.licenseeName) {

      // Initialize yearly entry if it does not exist
      if (!yearlyAggregatedData.has(numericYear)) {
        yearlyAggregatedData.set(numericYear, { value: 0, isComplete: true });
      }

      // Aggregate the quarterly values and check for completeness
      const yearData = yearlyAggregatedData.get(numericYear)!;
      if (typeof item.payment_amount === 'number' && !isNaN(item.payment_amount)) {
        yearData.value += item.payment_amount;
      } else if (typeof item.results === 'number' && !isNaN(item.results)) {
        yearData.value += item.results;
      } else {
        yearData.isComplete = false; // Mark as incomplete if any data is missing
      }

      // Update the yearly data entry
      yearlyAggregatedData.set(numericYear, yearData);
    }
  });

  // Transform the results to TPY and minTPY formats
  this.filteredMultiplePayments = this.filteredMultiplePayments.map(item => {
    const numericYear = parseInt(item.year, 10);
    const yearData = yearlyAggregatedData.get(numericYear);

    if (yearData) {
      // If all quarters are present, assign as TPY; otherwise, assign as minTPY
      item.payment_amount = yearData.value;
      item.eq_type = yearData.isComplete ? 'TPY' : 'minTPY';
    }

    return item;
  });

  // Update the same in payments data
  this.paymentData = this.paymentData.map(item => {
    const numericYear = parseInt(item.year, 10);
    const yearData = yearlyAggregatedData.get(numericYear);

    if (yearData) {
      // If all quarters are present, assign as TPY; otherwise, assign as minTPY
      item.payment_amount = yearData.value;
      item.eq_type = yearData.isComplete ? 'TPY' : 'minTPY';
    }

    return item;
  });
}


plotData(): void {
  const yearPaymentsMap = new Map<number, { value: number; isResult: boolean; rowData: any }>();
  const yearFilteredMultiplePaymentsGreenMap = new Map<number, number>();
  const yearFilteredMultiplePaymentsYellowMap = new Map<number, number>();
  const yearMinTPYMap = new Map<number, number>();
  const yearPaymentsMinTPYMap = new Map<number, number>();
  const yearOthersMinTPYMap = new Map<number, number>();
  const yearMPOthersMinTPYMap = new Map<number, number>();
  const yearRevenuesMap = new Map<number, number>();

  // Process grouped data for primary payments (Payment and Calculated Payment)
  Object.entries(this.groupedTableData).forEach(([year, data]) => {
    const numericYear = parseInt(year, 10);
    if (!isNaN(numericYear) && data.primary) {
      let value: number | undefined;
      let isResult = false;

      if (
        data.primary.eq_type === 'TPY' &&
        typeof data.primary.payment_amount === 'number' &&
        !isNaN(data.primary.payment_amount)
      ) {
        value = data.primary.payment_amount;
      } else if (data.primary.eq_type === 'TPY' || data.primary.adv_eq_type === 'TPY') {
        if (typeof data.primary.results === 'number' && !isNaN(data.primary.results)) {
          value = data.primary.results;
          isResult = true;
        } else if (typeof data.primary.eq_result === 'number' && !isNaN(data.primary.eq_result)) {
          value = data.primary.eq_result;
          isResult = true;
        }
      }

      if (value !== undefined) {
        yearPaymentsMap.set(numericYear, { value, isResult, rowData: data.primary });
      }
    }
  });

  // Process filtered multiple payments and calculate MP Others MinTPY
  const quarterlyPaymentsMap = new Map<number, { sum: number; count: number }>();

  this.filteredMultiplePayments.forEach((item) => {
    const numericYear = parseInt(item.year, 10);
    const eqType = item.eq_type?.toUpperCase();

    if (
      !isNaN(numericYear) &&
      item.licensor === this.licensorName &&
      (item.indiv_licensee === this.licenseeName || item.licensee?.includes(this.licenseeName))
    ) {
      if (eqType === 'TPY') {
        const value =
          item.payment_amount !== null && !isNaN(item.payment_amount)
            ? item.payment_amount
            : item.results;
        const isResult = item.payment_amount === null || isNaN(item.payment_amount);

        if (!yearPaymentsMap.has(numericYear)) {
          if (typeof value === 'number' && !isNaN(value)) {
            if (isResult) {
              yearFilteredMultiplePaymentsYellowMap.set(numericYear, value);
            } else {
              yearFilteredMultiplePaymentsGreenMap.set(numericYear, value);
            }
          }
        }
      } else if (eqType === 'TPQ') {
        if (!quarterlyPaymentsMap.has(numericYear)) {
          quarterlyPaymentsMap.set(numericYear, { sum: 0, count: 0 });
        }
        const quarterlyData = quarterlyPaymentsMap.get(numericYear)!;
        const quarterlyValue = item.payment_amount ?? item.results;
        if (typeof quarterlyValue === 'number' && !isNaN(quarterlyValue)) {
          quarterlyData.sum += quarterlyValue;
          quarterlyData.count += 1;
        }
      }

      // Process MP Others MinTPY
      if (['PSPY', 'FFPY', 'RPY', 'LSPY'].some((type) => eqType?.endsWith(type))) {
        const value = item.payment_amount ?? item.results ?? 0;
        if (typeof value === 'number' && !isNaN(value)) {
          yearMPOthersMinTPYMap.set(numericYear, (yearMPOthersMinTPYMap.get(numericYear) || 0) + value);
        }
      }
    }
  });

  // Calculate minTPY for incomplete multiple payment years
  quarterlyPaymentsMap.forEach((data, year) => {
    if (
      data.count < 4 &&
      !yearPaymentsMap.has(year) &&
      !yearFilteredMultiplePaymentsGreenMap.has(year) &&
      !yearFilteredMultiplePaymentsYellowMap.has(year)
    ) {
      yearMinTPYMap.set(year, data.sum);
    }
  });

  // Process annual revenue data
  this.annualRevenues.forEach((revenue) => {
    if (revenue.year && typeof revenue.total_revenue === 'number' && !isNaN(revenue.total_revenue)) {
      yearRevenuesMap.set(revenue.year, revenue.total_revenue);
    }
  });

  // Process payments minTPY data and sum for "Others MinTPY"
  this.paymentData.forEach((item) => {
    const numericYear = parseInt(item.year, 10);
    const eqType = item.eq_type?.toUpperCase();
    if (
      !isNaN(numericYear) &&
      item.licensor === this.licensorName &&
      item.licensee === this.licenseeName
    ) {
      // Check if eq_type matches PSPY, FFPY, RPY, LSPY or their prefixed versions
      if (['PSPY', 'FFPY', 'RPY', 'LSPY'].some((type) => eqType?.endsWith(type))) {
        const value = item.payment_amount ?? item.results ?? 0;
        if (typeof value === 'number' && !isNaN(value)) {
          yearOthersMinTPYMap.set(numericYear, (yearOthersMinTPYMap.get(numericYear) || 0) + value);
        }
      } else if (eqType === 'TPQ') {
        // For payments minTPY data
        if (!yearPaymentsMinTPYMap.has(numericYear)) {
          yearPaymentsMinTPYMap.set(numericYear, item.payment_amount ?? item.results);
        } else {
          const currentSum = yearPaymentsMinTPYMap.get(numericYear)!;
          yearPaymentsMinTPYMap.set(
            numericYear,
            currentSum + (item.payment_amount ?? item.results ?? 0)
          );
        }
      }
    }
  });

  // Prepare data arrays for each trace with priority
  const sortedYears = Array.from(
    new Set([
      ...yearPaymentsMap.keys(),
      ...yearRevenuesMap.keys(),
      ...yearFilteredMultiplePaymentsGreenMap.keys(),
      ...yearFilteredMultiplePaymentsYellowMap.keys(),
      ...yearMinTPYMap.keys(),
      ...yearPaymentsMinTPYMap.keys(),
      ...yearOthersMinTPYMap.keys(),
      ...yearMPOthersMinTPYMap.keys(),
    ])
  ).sort((a, b) => a - b);

  const payments: (number | null)[] = [];
  const results: (number | null)[] = [];
  const paymentsMinTPY: (number | null)[] = [];
  const othersMinTPY: (number | null)[] = [];
  const filteredMultiplePaymentsGreen: (number | null)[] = [];
  const filteredMultiplePaymentsYellow: (number | null)[] = [];
  const minTPY: (number | null)[] = [];
  const mpOthersMinTPY: (number | null)[] = [];
  const revenues: (number | null)[] = [];

  sortedYears.forEach((year) => {
    const paymentData = yearPaymentsMap.get(year);
    const paymentsMinTPYValue = yearPaymentsMinTPYMap.get(year) ?? null;
    const othersMinTPYValue = yearOthersMinTPYMap.get(year) ?? null;
    const greenPayment = yearFilteredMultiplePaymentsGreenMap.get(year) ?? null;
    const yellowPayment = yearFilteredMultiplePaymentsYellowMap.get(year) ?? null;
    const minTPYValue = yearMinTPYMap.get(year) ?? null;
    const mpOthersMinTPYValue = yearMPOthersMinTPYMap.get(year) ?? null;
    const revenue = yearRevenuesMap.get(year) ?? null;

    let payment: number | null = null;
    let result: number | null = null;
    let paymentsMinTPYVal: number | null = null;
    let othersMinTPYVal: number | null = null;
    let filteredMultiplePaymentsGreenVal: number | null = null;
    let filteredMultiplePaymentsYellowVal: number | null = null;
    let minTPYVal: number | null = null;
    let mpOthersMinTPYVal: number | null = null;

    // Apply priority logic
    if (paymentData) {
      // Payment data exists
      if (paymentData.isResult) {
        result = paymentData.value;
      } else {
        payment = paymentData.value;
      }
    } else if (paymentsMinTPYValue !== null) {
      paymentsMinTPYVal = paymentsMinTPYValue;
    } else if (othersMinTPYValue !== null) {
      othersMinTPYVal = othersMinTPYValue;
    } else if (greenPayment !== null || yellowPayment !== null) {
      if (greenPayment !== null) {
        filteredMultiplePaymentsGreenVal = greenPayment;
      } else if (yellowPayment !== null) {
        filteredMultiplePaymentsYellowVal = yellowPayment;
      }
    } else if (minTPYValue !== null) {
      minTPYVal = minTPYValue;
    } else if (mpOthersMinTPYValue !== null) {
      mpOthersMinTPYVal = mpOthersMinTPYValue;
    }

    payments.push(payment);
    results.push(result);
    paymentsMinTPY.push(paymentsMinTPYVal);
    othersMinTPY.push(othersMinTPYVal);
    filteredMultiplePaymentsGreen.push(filteredMultiplePaymentsGreenVal);
    filteredMultiplePaymentsYellow.push(filteredMultiplePaymentsYellowVal);
    minTPY.push(minTPYVal);
    mpOthersMinTPY.push(mpOthersMinTPYVal);
    revenues.push(revenue);
  });

  // Define Plotly traces
  const revenueTrace = {
    x: sortedYears,
    y: revenues,
    type: 'bar',
    name: 'Total Revenue',
    marker: { color: 'rgba(200, 200, 200, 0.7)' },
    hoverinfo: 'text',
    hovertext: revenues.map((rev, i) =>
      rev !== null ? `Year: ${sortedYears[i]}<br>Total Revenue: ${this.formatNumber(rev)}` : ''
    ),
    offsetgroup: 0,
  };
  const paymentTrace = {
    x: sortedYears,
    y: payments,
    type: 'bar',
    name: 'Payments (TPY)',
    marker: { color: 'rgba(0, 123, 255, 0.8)' },
    hoverinfo: 'text',
    hovertext: payments.map((val, i) =>
      val !== null ? `Year: ${sortedYears[i]}<br>Payment: ${this.formatNumber(val)}` : ''
    ),
    offsetgroup: 1,
  };
  const resultTrace = {
    x: sortedYears,
    y: results,
    type: 'bar',
    name: 'Calculated Payments (TPY)',
    marker: { color: 'rgba(255, 165, 0, 0.8)' },
    hoverinfo: 'text',
    hovertext: results.map((val, i) =>
      val !== null ? `Year: ${sortedYears[i]}<br>Calculated Payment: ${this.formatNumber(val)}` : ''
    ),
    offsetgroup: 1,
  };
  const paymentsMinTPYTrace = {
    x: sortedYears,
    y: paymentsMinTPY,
    type: 'bar',
    name: 'Payments (MinTPY)',
    marker: { color: 'rgba(165, 42, 42, 0.8)' },
    hoverinfo: 'text',
    hovertext: paymentsMinTPY.map((val, i) =>
      val !== null ? `Year: ${sortedYears[i]}<br>Payments (MinTPY): ${this.formatNumber(val)}` : ''
    ),
    offsetgroup: 1,
  };
  const othersMinTPYTrace = {
    x: sortedYears,
    y: othersMinTPY,
    type: 'bar',
    name: 'Payments "Others" (MinTPY)',
    marker: { color: 'rgba(0, 0, 0, 0.8)' },
    hoverinfo: 'text',
    hovertext: othersMinTPY.map((val, i) =>
      val !== null ? `Year: ${sortedYears[i]}<br>Payments "Others" (MinTPY): ${this.formatNumber(val)}` : ''
    ),
    offsetgroup: 1,
  };
  const filteredMultiplePaymentsGreenTrace = {
    x: sortedYears,
    y: filteredMultiplePaymentsGreen,
    type: 'bar',
    name: 'Multiple Payments (TPY)',
    marker: { color: 'rgba(0, 255, 0, 0.8)' },
    hoverinfo: 'text',
    hovertext: filteredMultiplePaymentsGreen.map((val, i) =>
      val !== null ? `Year: ${sortedYears[i]}<br>Multiple Payment: ${this.formatNumber(val)}` : ''
    ),
    offsetgroup: 1,
  };
  const filteredMultiplePaymentsYellowTrace = {
    x: sortedYears,
    y: filteredMultiplePaymentsYellow,
    type: 'bar',
    name: 'Calculated Multiple Payments (TPY)',
    marker: { color: 'rgba(255, 255, 0, 0.8)' },
    hoverinfo: 'text',
    hovertext: filteredMultiplePaymentsYellow.map((val, i) =>
      val !== null
        ? `Year: ${sortedYears[i]}<br>Calculated Multiple Payments: ${this.formatNumber(val)}`
        : ''
    ),
    offsetgroup: 1,
  };
  const minTPYTrace = {
    x: sortedYears,
    y: minTPY,
    type: 'bar',
    name: 'Multiple Payments (MinTPY)',
    marker: { color: 'rgba(255, 0, 0, 0.8)' },
    hoverinfo: 'text',
    hovertext: minTPY.map((val, i) =>
      val !== null ? `Year: ${sortedYears[i]}<br>Multiple Payments (MinTPY): ${this.formatNumber(val)}` : ''
    ),
    offsetgroup: 1,
  };
  const mpOthersMinTPYTrace = {
    x: sortedYears,
    y: mpOthersMinTPY,
    type: 'bar',
    name: 'MP "Others" (MinTPY)',
    marker: { color: 'rgba(128, 0, 128, 0.8)' }, // Purple color
    hoverinfo: 'text',
    hovertext: mpOthersMinTPY.map((val, i) =>
      val !== null ? `Year: ${sortedYears[i]}<br>MP "Others" (MinTPY): ${this.formatNumber(val)}` : ''
    ),
    offsetgroup: 1,
  };

  const layout = {
    height: 600,
    autosize: true,
    title: 'Payments By Revenues Over Years',
    xaxis: { title: 'Year', type: 'category' },
    yaxis: {
      title: 'Payment Amount (in thousands)',
      tickformat: ',d',
      type: 'linear',
      rangemode: 'tozero',
    },
    barmode: 'overlay',
    legend: { orientation: 'h', y: 1.1 },
    hovermode: 'closest',
  };

  Plotly.newPlot('myDiv', [
    revenueTrace,
    paymentTrace,
    resultTrace,
    paymentsMinTPYTrace,
    othersMinTPYTrace,
    filteredMultiplePaymentsGreenTrace,
    filteredMultiplePaymentsYellowTrace,
    minTPYTrace,
    mpOthersMinTPYTrace,
  ], layout);
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

        // Filtered based on both licensor and known licensee conditions
        this.filteredMultiplePayments = data.filter(item => {
          const meetsLicensorCondition = item.licensor === this.licensorName;
          const meetsLicenseeCondition = item.indiv_licensee === this.licenseeName;
          return meetsLicensorCondition && meetsLicenseeCondition;
        });

        // Filtered based on licensor only
        const confirmedTableRows = this.filteredMultiplePayments.map(item => item.id);
        this.multiplePayments = data.filter(item => !confirmedTableRows.includes(item.id) && item.licensor === this.licensorName);

        // Filter for licenseeName only
        const matchingRowsLicenseeOnly = data.filter(item => item.indiv_licensee === this.licenseeName);

        // Initialize unique payments
        this.initializeUniquePayments();

        // Call performRevenueCalculations to calculate results for adv_eq_type 'TRY'
        this.performRevenueCalculations();  // <-- This is where we add the calculation for `TRY`
      },
      (error) => {
        console.error('Error fetching data for multiple licensees:', error);
      }
    );
  }

  performRevenueCalculations(): void {
    if (!this.annualRevenues || this.annualRevenues.length === 0) {
      console.error('No annual revenues data available.');
      return;
    }

    this.filteredMultiplePayments.forEach(payment => {
      // Check if adv_eq_type is 'TRY'
      if (payment.adv_eq_type === 'TRY') {
        const matchingRevenue = this.annualRevenues.find(revenue =>
          revenue.licensor === payment.licensor && revenue.year === payment.year
        );

        if (matchingRevenue && payment.coef) {
          const totalRevenue = matchingRevenue.total_revenue;
          const coef = parseFloat(payment.coef);

          // Perform the calculation: coef * total_revenue
          payment.results = coef * totalRevenue;

        } else {
          console.log(`No matching revenue found for ${payment.licensor} (${payment.year}) or coefficient is missing.`);
        }
      }
    });

    this.plotData();  // Re-plot the data to include the new results
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



  filterDataByLicensee() {
    // Assuming filteredDataDefined and filteredMultiplePayments are arrays of objects

    // Filter the data
    const filteredData = this.filteredDataDefined.filter(item =>
      item.licensee && item.licensee.includes(this.licenseeName)
    );

    const filteredPayments = this.filteredMultiplePayments.filter(item =>
      item.licensee && item.licensee.includes(this.licenseeName)
    );

    // Combine both datasets or handle them as needed
    return [...filteredData, ...filteredPayments]; // You can modify how you want to return or display them
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

  toggleDetailVisibility(key: string): void {
    const currentState = this.showDetailsMap.get(key) || false;
    this.showDetailsMap.set(key, !currentState);

  }
  toggleDetailsVisibility(item: any): void {
    item.showDetails = !item.showDetails;
  }

  isDetailsVisible(key: string): boolean {
    return this.showDetailsMap.get(key) || false;
  }

  submitFeedbackToDatabase(item: any, feedback: any): void {
    // Here, you should send the feedback to the database using an appropriate HTTP request
    console.log('Submitting feedback to the database:', feedback);
    // Example: this.paymentConnection.submitFeedback(item.id, feedback).subscribe(...);
  }
  getTableColumns(): string[] {
    if (this.groupedTableData) {
      const firstYear = Object.keys(this.groupedTableData)[0];
      if (firstYear && this.groupedTableData[firstYear].primary) {
        return Object.keys(this.groupedTableData[firstYear].primary).filter(col => col !== 'showDetails');
      }
    }
    return [];
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

getPlotData(): any[] {
  // Replace this logic with the actual condition for filtering plot-related rows
  return this.tableData.filter(row => row.isUsedInPlot);
  // Example condition: 'isUsedInPlot' should be true for rows used in the plot
}
isFloatOrDouble(value: any): boolean {
  // Check if the value is a number and has a decimal point
  return !isNaN(parseFloat(value)) && isFinite(value) && value % 1 !== 0;
}


groupTableData(): void {
  this.groupedTableData = {};
  const usedYears = new Set<string>();

  // First pass: Group TPY rows with payment_amount from primary payments
  this.paymentData.forEach(item => {
    const year = item.year?.toString();
    if (year && !usedYears.has(year) && this.isRowUsedInPlot(item, 'payments')) {
      if (typeof item.payment_amount === 'number' && !isNaN(item.payment_amount)) {
        this.groupedTableData[year] = { primary: item, secondary: [] };
        usedYears.add(year);
      }
    }
  });

  // Second pass: Group TPY rows with results if no payment_amount found in primary payments
  this.paymentData.forEach(item => {
    const year = item.year?.toString();
    if (year && !usedYears.has(year) && this.isRowUsedInPlot(item, 'payments')) {
      this.groupedTableData[year] = { primary: item, secondary: [] };
      usedYears.add(year);
    }
  });

  // Third pass: Add multiple payments to the groupedTableData
  this.multiplePayments.forEach(item => {
    const year = item.year?.toString();
    if (year && !usedYears.has(year) && this.isRowUsedInPlot(item, 'multiplePayments')) {
      if (typeof item.payment_amount === 'number' && !isNaN(item.payment_amount)) {
        this.groupedTableData[year] = { primary: item, secondary: [] };
        usedYears.add(year);
      }
    }
  });

  // Final pass: Add remaining multiple payments rows as secondary
  this.multiplePayments.forEach(item => {
    const year = item.year?.toString();
    if (year) {
      if (!this.groupedTableData[year]) {
        this.groupedTableData[year] = { primary: null, secondary: [] };
      }
      if (!this.groupedTableData[year].primary || item !== this.groupedTableData[year].primary) {
        this.groupedTableData[year].secondary.push(item);
      }
    }
  });
}



formatNumber(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
prepareTableData(): void {
  this.paymentConnection.getPayments().subscribe(
    (data: any[]) => {
      this.paymentData = data.filter(item => item.licensor === this.licensorName && item.licensee === this.licenseeName);
      this.groupTableData();
      this.plotData(); // Call plotData after preparing the table data
    },
    (error) => {
      console.error('Error fetching payments data:', error);
    }
  );
}
filterSecondaryRows(year: string): any[] {
  const secondaryRows = this.groupedTableData[year]?.secondary || [];
  return secondaryRows;
}


isRowUsedInPlot(item: any, tableType: 'payments' | 'multiplePayments'): boolean {
  const licenseeMatch = tableType === 'payments'
    ? item.licensee === this.licenseeName
    : (item.indiv_licensee === this.licenseeName || item.indiv_licensee === null && item.licensee === this.licenseeName); // Adjusted logic

  const licensorMatch = item.licensor === this.licensorName;

  // Check if it's a 'TPY' row (either in eq_type or adv_eq_type)
  if (item.eq_type === 'TPY' || item.adv_eq_type === 'TPY') {
    if (licenseeMatch && licensorMatch) {
      // Prioritize payment_amount for TPY rows
      if (typeof item.payment_amount === 'number' && !isNaN(item.payment_amount)) {
        return true;
      }
      // If no payment_amount, check for valid results
      if (typeof item.results === 'number' && !isNaN(item.results)) {
        return true;
      }
      // If no results, check for valid eq_result
      if (typeof item.eq_result === 'number' && !isNaN(item.eq_result)) {
        return true;
      }
    }
  }
  return false;
}


toggleYearExpansion(year: string): void {
  if (this.expandedYears.has(year)) {
    this.expandedYears.delete(year);
  } else {
    this.expandedYears.add(year);
  }
}

isYearExpanded(year: string): boolean {
  return this.expandedYears.has(year);
}

getSecondaryRows(year: string): any[] {
  return this.groupedTableData[year]?.secondary || [];
}

objectKeys(obj: any): string[] {
  return Object.keys(obj);
}
}
