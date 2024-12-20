// licensing-revenues.component.ts
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { PaymentConnection } from '../payment-connection.service'; // Adjust the path as necessary
import { Subscription, forkJoin } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner'; // If using ngx-spinner for loading indicators
declare var Plotly: any;

// Helper function to generate random HEX colors
function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

@Component({
  selector: 'app-licensing-revenues',
  templateUrl: './licensing-revenues.component.html',
  styleUrls: ['./licensing-revenues.component.css']
})
export class LicensingRevenuesComponent implements OnInit, AfterViewInit, OnDestroy {
  licensors: string[] = []; // List of licensors for the dropdown
  selectedLicensor: string = ''; // Currently selected licensor
  annualRevenues: any[] = []; // Raw data fetched
  payments: any[] = []; // Data from payments table
  multiplePayments: any[] = []; // Data from multiple_payments table

  yearRevenuesMap: Map<number, number> = new Map(); // Maps year to licensing_revenue
  licenseeRevenuesMap: Map<string, Map<number, number>> = new Map(); // Maps licensee to year to payment_amount
  sortedYears: number[] = []; // Sorted list of years
  uniqueLicensees: string[] = []; // Unique licensees for the selected licensor

  licenseeTotalPaymentsMap: Map<string, number> = new Map(); // Maps licensee to total payments

  isLoadingLicensors: boolean = false;
  isLoadingRevenues: boolean = false;
  fetchError: boolean = false;

  // ViewChild to get the div element
  @ViewChild('licensingRevenuesDiv') licensingRevenuesDiv!: ElementRef;

  // To manage subscriptions
  private subscriptions: Subscription = new Subscription();

  // Map to store licensee-color associations
  licenseeColorMap: Map<string, string> = new Map();

  constructor(private paymentConnection: PaymentConnection, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.loadPlotlyScript().then(() => {
      console.log('Plotly.js script loaded successfully');
      this.fetchLicensors(); // Fetch licensors first
    }).catch(error => {
      console.error('Error loading Plotly.js script:', error);
    });
  }

  ngAfterViewInit(): void {
    // Plot will be called after data is fetched
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Dynamically loads the Plotly.js script.
   * @returns A Promise that resolves when the script is loaded.
   */
  loadPlotlyScript(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Check if Plotly is already loaded
      if (typeof Plotly !== 'undefined') {
        resolve();
        return;
      }

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

  /**
   * Fetches the list of licensors using the PaymentConnection service.
   */
  fetchLicensors(): void {
    this.isLoadingLicensors = true;
    this.spinner.show(); // Show spinner
    const licensorSub = this.paymentConnection.getLicensors().subscribe(
      (data: string[]) => {
        this.licensors = data;
        console.log("Fetched Licensors:", this.licensors);
        // Set default licensor (e.g., the first in the list)
        if (this.licensors.length > 0) {
          this.selectedLicensor = this.licensors[0];
          this.fetchAnnualRevenues();
        }
        this.isLoadingLicensors = false;
        this.spinner.hide(); // Hide spinner
      },
      (error) => {
        console.error('Error fetching licensors:', error);
        this.isLoadingLicensors = false;
        this.spinner.hide(); // Hide spinner
        this.fetchError = true;
      }
    );
    this.subscriptions.add(licensorSub);
  }

  /**
   * Fetches annual revenues, payments, and multiple payments based on the selected licensor.
   * Filters payments to include only those with specific eq_type values.
   * Includes payments from multiple_payments with eq_type == 'TPY'.
   */
  fetchAnnualRevenues(): void {
    this.isLoadingRevenues = true;
    this.spinner.show(); // Show spinner

    // Define API calls
    const annualRevenues$ = this.paymentConnection.getAnnualRevenues();
    const payments$ = this.paymentConnection.getPayments();
    const multiplePayments$ = this.paymentConnection.getMultiplePayments();

    // Fetch all data concurrently
    const combined$ = forkJoin([annualRevenues$, payments$, multiplePayments$]);

    const revenueSub = combined$.subscribe(
      ([annualRevenues, payments, multiplePayments]) => {
        // Log raw results from the payments table
        console.log('Results values from payments table:', payments.map(payment => payment.results));

        // Filter annualRevenues based on selectedLicensor
        this.annualRevenues = annualRevenues.filter(item => item.licensor === this.selectedLicensor);
        console.log(`Annual Revenues for ${this.selectedLicensor}:`, this.annualRevenues);

        // Define desired eq_type values for payments
        const desiredEqTypes = ['TPY', 'MaxTPY', 'MinTPY', 'TPQ', 'PSPY', 'FFPY', 'RPYI', 'LSPY'];

        // Filter payments based on selectedLicensor and desired eq_type values
        this.payments = payments.filter(
          item => item.licensor === this.selectedLicensor && desiredEqTypes.includes(item.eq_type)
        );

        // Filter multiplePayments to include only eq_type == 'TPY'
        this.multiplePayments = multiplePayments.filter(
          item => item.licensor === this.selectedLicensor && item.eq_type === 'TPY'
        );

        console.log(`Filtered Payments for ${this.selectedLicensor}:`, this.payments);
        console.log(`Filtered Multiple Payments for ${this.selectedLicensor}:`, this.multiplePayments);

        this.prepareYearlyData();
        this.isLoadingRevenues = false;
        this.fetchError = false;
        this.spinner.hide(); // Hide spinner
        // Plot after the view has been updated
        setTimeout(() => {
          this.plotData();
        }, 0);
      },
      (error) => {
        console.error('Error fetching data:', error);
        this.isLoadingRevenues = false;
        this.fetchError = true;
        this.spinner.hide(); // Hide spinner
      }
    );

    this.subscriptions.add(revenueSub);
  }


  /**
   * Prepares yearly data by mapping year to licensing revenue and payment amounts per licensee.
   * Includes 'payment_amount' from both payments and multiple_payments tables.
   * Uses 'results' from payments table only when 'payment_amount' is empty or null.
   * Excludes 'results' from multiple_payments.
   */
  prepareYearlyData(): void {
    // Clear previous data
    this.yearRevenuesMap.clear();
    this.uniqueLicensees = [];

    const DEFAULT_LICENSEE = 'Unknown Licensee';

    // Process annualRevenues to map year to licensing_revenue
    this.annualRevenues.forEach((revenue) => {
        const { year, licensing_revenue } = revenue;
        if (year && typeof licensing_revenue === 'number' && !isNaN(licensing_revenue)) {
            this.yearRevenuesMap.set(year, licensing_revenue);
        }
    });

    // Collect unique licensees directly from payments
    this.uniqueLicensees = Array.from(
        new Set(
            this.payments
                .map((payment) => payment.licensee?.trim() || DEFAULT_LICENSEE)
                .filter(Boolean)
        )
    );

    // Log the processed data for debugging
    console.log('Processed years:', Array.from(this.yearRevenuesMap.keys()));
    console.log('Unique licensees:', this.uniqueLicensees);

    // Collect all unique years from annualRevenues and payments
    const allYears = new Set<number>();
    this.yearRevenuesMap.forEach((_, year) => allYears.add(year));
    this.payments.forEach((payment) => {
        if (payment.year) {
            allYears.add(payment.year);
        }
    });

    this.sortedYears = Array.from(allYears).sort((a, b) => a - b);
    console.log('Sorted years:', this.sortedYears);
}



  /**
   * Formats a number with commas as thousand separators.
   * @param num The number to format.
   * @returns A string representing the formatted number.
   */
  formatNumber(num: number): string {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /**
   * Returns a unique color for each licensee.
   * Generates a random color if the licensee doesn't have one assigned yet.
   * @param licensee The name of the licensee.
   * @returns A color string in HEX format.
   */
  getLicenseeColor(licensee: string): string {
    // Assign a fixed color to "Unknown Licensee"
    if (licensee === 'Unknown Licensee') {
      return '#808080'; // Grey color
    }

    // Check if the licensee already has an assigned color
    if (this.licenseeColorMap.has(licensee)) {
      return this.licenseeColorMap.get(licensee)!;
    }

    // Determine the index of the licensee
    const index = this.uniqueLicensees.indexOf(licensee);

    // Generate a distinct color based on index and total licensees
    const distinctColor = this.getDistinctColor(index, this.uniqueLicensees.length);

    // Assign the generated color to the licensee
    this.licenseeColorMap.set(licensee, distinctColor);

    return distinctColor;
  }

  /**
  * Generates a distinct HEX color based on the index.
  * @param index The index of the licensee.
  * @param total The total number of licensees.
  * @returns A HEX color string.
  */
  getDistinctColor(index: number, total: number): string {
    const hue = index * (360 / total);
    return `hsl(${hue}, 70%, 50%)`;
  }

  /**
   * Handles changes in the licensor selection dropdown.
   */
  onLicensorChange(): void {
    console.log('Selected Licensor:', this.selectedLicensor);
    this.fetchAnnualRevenues();
  }

  /**
   * Plots the licensing revenues and payment amounts using Plotly.js as stacked bars with an "Others" trace.
   * Implements dynamic updating of the "Others" trace based on the visibility of licensee traces.
   */
  plotData(): void {
    if (!this.licensingRevenuesDiv) {
        console.warn('Plot container not found.');
        return;
    }

    if (this.sortedYears.length === 0) {
        console.warn('No data available to plot.');
        Plotly.purge(this.licensingRevenuesDiv.nativeElement);
        return;
    }

    // Licensing Revenue Trace - Background bar
    const licensingRevenueTrace = {
        x: this.sortedYears,
        y: this.sortedYears.map(year => this.yearRevenuesMap.get(year) || 0),
        type: 'bar',
        name: 'Licensing Revenue',
        marker: { color: 'rgba(128, 128, 128, 0.6)' }, // Grey color with 60% opacity
        hoverinfo: 'text',
        hovertext: this.sortedYears.map(year =>
            `Year: ${year}<br>Licensing Revenue: $${this.formatNumber(this.yearRevenuesMap.get(year) || 0)}`
        ),
        offsetgroup: '0', // Unique group for background
        base: 0, // Start at zero
        showlegend: true,
    };

    const data: any[] = [licensingRevenueTrace];

    // Add Payment Amounts or Results per Licensee
    if (this.uniqueLicensees.length > 0) {
        const paymentTraces = this.uniqueLicensees.map(licensee => {
            const yData = this.sortedYears.map(year => {
                const payment = this.payments.find(
                    p => p.licensee === licensee && p.year === year
                );

                if (!payment) return 0;

                // Use `payment_amount` if it's truthy; otherwise, fallback to `results`
                return payment.payment_amount
                    ? payment.payment_amount
                    : payment.results || 0;
            });

            return {
                x: this.sortedYears,
                y: yData,
                type: 'bar',
                name: licensee,
                marker: { color: this.getLicenseeColor(licensee) },
                hoverinfo: 'text',
                hovertext: this.sortedYears.map((year, i) =>
                    `Year: ${year}<br>Licensee: ${licensee}<br>Amount: $${this.formatNumber(yData[i])}`
                ),
                offsetgroup: '1', // Unique offset for stacking
                showlegend: true,
            };
        });

        data.push(...paymentTraces);
    }

    const layout = {
        title: `Licensing Revenues and Payment Amounts for ${this.selectedLicensor}`,
        xaxis: {
            title: 'Year',
            type: 'category',
            tickangle: -45,
        },
        yaxis: {
            title: 'Amount (in USD)',
            tickformat: ',d',
            type: 'linear',
            rangemode: 'tozero',
        },
        barmode: 'stack', // Enable stacking
        height: 600,
        width: 900,
        plot_bgcolor: '#ffffff',
        paper_bgcolor: '#ffffff',
        font: {
            family: 'Arial, sans-serif',
            size: 12,
            color: '#000000',
        },
        legend: {
            orientation: 'h',
            y: 1.1,
            x: 0.5,
            xanchor: 'center',
        },
        hovermode: 'closest',
    };

    Plotly.newPlot(this.licensingRevenuesDiv.nativeElement, data, layout).then(() => {
        console.log('Licensing Revenues graph plotted successfully');
    }).catch((error: any) => {
        console.error('Error plotting licensing revenues graph:', error);
    });

    window.onresize = () => {
        Plotly.Plots.resize(this.licensingRevenuesDiv.nativeElement);
    };
}






}
