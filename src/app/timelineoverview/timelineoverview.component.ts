// timelineoverview.component.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConnectionService } from '../connection.service';
import { PaymentConnection } from '../payment-connection.service';
import { ActivatedRoute, Router } from '@angular/router';

declare var Plotly: any;

interface PaymentEntry {
  year: number;
  payment: number;
}

interface AnnualRevenue {
  licensor: string;
  year: number | string;
  licensing_revenue: string | number;
}

interface PaymentData {
  licensor: string;
  licensee: string;
  year: number | string;
  payment_amount?: string | number;
  eq_type?: string;
  adv_eq_type?: string;
  signed_date?: string;
  expiration_date?: string;
  results?: string | number;
}

@Component({
  selector: 'app-timeline-overview',
  templateUrl: './timelineoverview.component.html',
  styleUrls: ['./timelineoverview.component.css'],
})
export class TimelineOverviewComponent implements OnInit, AfterViewInit {
  private groupedLicenseDataSource = new BehaviorSubject<any[]>([]);
  groupedLicenseData$ = this.groupedLicenseDataSource.asObservable();

  groupedLicenseData: any[] = [];
  licensors: string[] = [];
  selectedLicensor: string = '';
  paymentData: PaymentData[] = [];
  annualRevenues: AnnualRevenue[] = [];
  filteredPayments: PaymentData[] = [];
  licenseeData: Map<string, PaymentEntry[]> = new Map();

  // Define a consistent grey color
  private GREY_COLOR = 'lightgrey';

  colorPalette: string[] = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728',
    '#9467bd', '#8c564b', '#e377c2', '#7f7f7f',
    '#bcbd22', '#17becf',
  ];

  // New properties for user feedback
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private connectionService: ConnectionService,
    private paymentConnection: PaymentConnection,
    private route: ActivatedRoute,
    private router: Router // Inject Router
  ) {}

  // ---------------- HELPER FUNCTIONS ----------------

  /**
   * If `eq_type` is "TPY" and payment_amount is valid, use that.
   * Else if eq_type is empty/null, and adv_eq_type is "TPY", use results.
   * Otherwise, returns 0.
   */
  private computePaymentValue(item: PaymentData): number {
    const eqType = item.eq_type?.trim().toUpperCase() || '';
    const advEqType = item.adv_eq_type?.trim().toUpperCase() || '';

    // eq_type is 'TPY' and we have a valid payment_amount?
    if (eqType === 'TPY' && item.payment_amount != null && !isNaN(parseFloat(item.payment_amount.toString()))) {
      return parseFloat(item.payment_amount.toString());
    }
    // eq_type is empty or null, but adv_eq_type is 'TPY' and we have valid results?
    else if (!eqType && advEqType === 'TPY' && item.results != null && !isNaN(parseFloat(item.results.toString()))) {
      return parseFloat(item.results.toString());
    }
    // Default to 0 if neither condition is met
    return 0;
  }

  /**
   * Filter out any payment items that don't satisfy our eq_type/adv_eq_type logic.
   */
  private filterPayments(data: PaymentData[]): PaymentData[] {
    return data.filter((item) => {
      const hasValidDates = item.signed_date || item.expiration_date; // At least one date must be present
      const hasLicensee = !!item.licensee; // Licensee must exist
      const hasLicensor = !!item.licensor; // Licensor must exist

      // Include items with valid dates and licensors/licensees
      return hasValidDates && hasLicensee && hasLicensor;
    });
  }

  /**
   * Normalize licensor names for consistent comparison.
   */
  private normalizeLicensorName(name: string): string {
    return name.trim().toLowerCase().replace(/[^\w\s]/gi, '');
  }

  // ---------------- LIFECYCLE HOOKS ----------------

  ngOnInit(): void {
    this.isLoading = true; // Start loading indicator

    // Fetch licensors and payments first
    Promise.all([
      this.fetchLicensors(),
      this.fetchPayments()
    ]).then(() => {
      this.isLoading = false; // End loading indicator

      // Subscribe to route parameters after data is loaded
      this.route.paramMap.subscribe(params => {
        const licensor = params.get('licensor');
        if (licensor) {
          this.selectedLicensor = licensor;
          this.onLicensorChange(); // Fetch and display data for the selected licensor
        } else {
          console.warn('No licensor parameter found in the route.');
          this.resetToDefaultView();
        }
      });
    }).catch(err => {
      this.isLoading = false; // End loading indicator
      console.error('Error fetching licensors or payments:', err);
      this.displayErrorMessage('Failed to load necessary data.');
    });

    // Subscribe to grouped license data
    this.groupedLicenseData$.subscribe({
      next: (data) => {
        this.groupedLicenseData = data;
        console.log('Grouped License Data Updated:', data);
        if (data.length > 0) {
          this.plotOverallDataByLicensor(); // Plot data for the timeline
        } else {
          console.warn('Grouped license data is empty. Skipping overall plot.');
          // Clear the overall plot if no data
          const plotDiv = document.getElementById('overallDiv');
          if (plotDiv) {
            Plotly.purge(plotDiv);
          }
        }
      },
      error: (error) => console.error('Error in groupedLicenseData subscription:', error),
    });

    // Load Plotly.js script
    this.loadPlotlyScript()
      .then(() => {
        console.log('Plotly.js script loaded successfully');
        // Plot initial data if available
        this.initializePlots();
      })
      .catch((error) => console.error('Error loading Plotly.js script:', error));
  }


  ngAfterViewInit(): void {
    // Removed redundant call to initializePlots()
  }

  /**
   * Reset the component to its default view when no licensor is selected.
   */
  resetToDefaultView(): void {
    // Example: Display a default message
    this.groupedLicenseDataSource.next([]); // Clear any existing data
    this.displayErrorMessage('Please select a licensor to view the timeline overview.');
    // Optionally, clear plots
    const plotDiv = document.getElementById('overallDiv');
    const licensorPaymentsPlot = document.getElementById('licensorPaymentsPlot');
    if (plotDiv) Plotly.purge(plotDiv);
    if (licensorPaymentsPlot) Plotly.purge(licensorPaymentsPlot);
  }

  /**
   * Display an error or prompt message to the user.
   */
  displayErrorMessage(message: string): void {
    this.errorMessage = message;
  }

  /**
   * Clear the error message.
   */
  clearErrorMessage(): void {
    this.errorMessage = '';
  }

  initializePlots(): void {
    // Check if DOM elements exist
    const overallDiv = document.getElementById('overallDiv');
    const licensorPaymentsPlot = document.getElementById('licensorPaymentsPlot');

    if (!overallDiv || !licensorPaymentsPlot) {
      console.warn('Plot divs not found during initialization. Retrying...');
      setTimeout(() => this.initializePlots(), 500); // Retry initialization
      return;
    }

    console.log('Plot divs initialized.');
    // Plot initial data
    const selectedLicensorRevenues = this.getSelectedLicensorRevenues();
    if (selectedLicensorRevenues.length > 0) {
      // Check if there are payments for the selected licensor
      const normalizedSelectedLicensor = this.normalizeLicensorName(this.selectedLicensor);
      const hasPayments = this.paymentData.some(item =>
        this.normalizeLicensorName(item.licensor) === normalizedSelectedLicensor &&
        this.computePaymentValue(item) > 0
      );
      if (hasPayments) {
        this.processDataAndPlot(selectedLicensorRevenues);
      } else {
        this.plotRevenueOnly(selectedLicensorRevenues);
      }
    } else {
      console.warn('No revenue data available for the selected licensor.');
      // Clear plots if no revenue data
      if (licensorPaymentsPlot) {
        Plotly.purge(licensorPaymentsPlot);
      }
      if (overallDiv) {
        Plotly.purge(overallDiv);
      }
    }
  }
  fetchLicensors(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.paymentConnection.getAnnualRevenues().subscribe({
        next: (data: AnnualRevenue[]) => {
          this.annualRevenues = data;
          this.licensors = Array.from(new Set(data.map((item) => item.licensor))).filter(Boolean);
          this.licensors.sort();
          console.log('Licensors from annual revenues:', this.licensors);
          resolve();
        },
        error: (err) => {
          console.error('Error fetching licensors:', err);
          reject(err);
        }
      });
    });
  }

  /**
   * Fetch payments and filter them.
   */
  fetchPayments(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.paymentConnection.getPayments().subscribe({
        next: (data: PaymentData[]) => {
          this.paymentData = data;
          // Use our new `filterPayments` logic
          this.filteredPayments = this.filterPayments(this.paymentData);
          console.log('Filtered Payments after fetchPayments:', this.filteredPayments);
          resolve(true);
        },
        error: (err) => reject(err),
      });
    });
  }

  filterAndGroupDataForLicensor(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.connectionService.getDataByLicensor(this.selectedLicensor).subscribe({
        next: (data: any[]) => {
          const licensorFilteredData = data.filter(
            (license) => license.licensor === this.selectedLicensor
          );
          const groupedData = this.groupLicenseData(licensorFilteredData);
          this.groupedLicenseDataSource.next(groupedData);
          console.log('Grouped Data after filterAndGroupDataForLicensor:', groupedData);
          resolve(true);
        },
        error: (err) => reject(err),
      });
    });
  }

  // ---------------- EVENT HANDLERS ----------------

  /**
   * Called when licensor changes in the dropdown or via route parameter,
   * fetches and plots data accordingly.
   */
  onLicensorChange(): void {
    if (!this.selectedLicensor) {
      console.warn('No licensor selected');
      this.resetToDefaultView();
      return;
    }

    // Check if the selected licensor exists in your data
    if (!this.licensors.includes(this.selectedLicensor)) {
      console.error(`Licensor "${this.selectedLicensor}" not found.`);
      this.displayErrorMessage(`Licensor "${this.selectedLicensor}" not found.`);
      // Optionally, navigate to a not-found page
      // this.router.navigate(['/not-found']);
      return;
    }

    console.log('Selected Licensor:', this.selectedLicensor);
    console.log('Annual Revenues:', this.annualRevenues);

    // Normalize the selected licensor's name for consistent comparison
    const normalizedSelectedLicensor = this.normalizeLicensorName(this.selectedLicensor);

    // 1. Filter revenues for the selected licensor
    const selectedLicensorRevenues = this.annualRevenues.filter(
      (item) => this.normalizeLicensorName(item.licensor) === normalizedSelectedLicensor
    );
    console.log('Selected Licensor Revenues:', selectedLicensorRevenues);

    // 2. Filter payments for the selected licensor
    this.filteredPayments = this.paymentData.filter((item) => {
      return (
        this.normalizeLicensorName(item.licensor) === normalizedSelectedLicensor &&
        this.computePaymentValue(item) > 0
      );
    });
    console.log('Filtered Payments:', this.filteredPayments);

    // 3. Fetch and group license data for the selected licensor
    this.connectionService.getDataByLicensor(this.selectedLicensor).subscribe({
      next: (data: any[]) => {
        // 1) Filter & group the licensor data (for timeline)
        const licensorFilteredData = data.filter(
          (license) => license.licensor === this.selectedLicensor
        );
        const groupedData = this.groupLicenseData(licensorFilteredData);
        this.groupedLicenseDataSource.next(groupedData); // Update the BehaviorSubject
        console.log('Grouped License Data:', groupedData);

        // 4. Conditional Plotting Based on Payment Availability
        if (this.filteredPayments.length > 0) {
          // If payments exist, process and plot payments along with remaining revenues
          this.processDataAndPlot(selectedLicensorRevenues);
        } else {
          // If no payments, plot revenues only
          this.plotRevenueOnly(selectedLicensorRevenues);
        }

        // 5. Optionally, plot the overall timeline (handled by subscription)
        // Removed direct call to plotOverallDataByLicensor
      },
      error: (err) => {
        console.error('Error fetching data for selected licensor:', err);
        this.displayErrorMessage('Failed to fetch data for the selected licensor.');
      },
    });
  }


  /**
   * Alternate method if your template calls onLicensorSelect() instead of onLicensorChange().
   * Example usage with Promise.all.
   */
  onLicensorSelect(): void {
    if (!this.selectedLicensor) {
      console.warn('No licensor selected.');
      return;
    }

    console.log(`Selected Licensor: ${this.selectedLicensor}`);

    // Wait for data
    Promise.all([this.filterAndGroupDataForLicensor(), this.fetchPayments()])
      .then(() => {
        const normalizedSelectedLicensor = this.normalizeLicensorName(this.selectedLicensor);

        // Re-filter the newly fetched payments
        this.filteredPayments = this.paymentData.filter((item) => {
          return (
            this.normalizeLicensorName(item.licensor) === normalizedSelectedLicensor &&
            this.computePaymentValue(item) > 0
          );
        });
        console.log('Filtered Payments after onLicensorSelect:', this.filteredPayments);

        const selectedLicensorRevenues = this.annualRevenues.filter(
          (item) => this.normalizeLicensorName(item.licensor) === normalizedSelectedLicensor
        );
        console.log('Selected Licensor Revenues after onLicensorSelect:', selectedLicensorRevenues);

        this.processDataAndPlot(selectedLicensorRevenues);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }

  // ---------------- PLOTTING LOGIC ----------------

  /**
   * Load Plotly.js dynamically.
   */
  loadPlotlyScript(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (typeof Plotly !== 'undefined') {
        resolve();
        return;
      }
      const scriptElement = document.createElement('script');
      scriptElement.src = 'https://cdn.plot.ly/plotly-2.25.2.min.js';
      scriptElement.onload = () => resolve();
      scriptElement.onerror = () => reject('Failed to load Plotly.js');
      document.head.appendChild(scriptElement);
    });
  }

  plotWithRetries(retryCount = 3): void {
    const overallDiv = document.getElementById('overallDiv');
    if (!overallDiv) {
      if (retryCount > 0) {
        console.warn(`#overallDiv not found. Retrying... (${3 - retryCount}/3)`);
        setTimeout(() => this.plotWithRetries(retryCount - 1), 500);
        return;
      } else {
        console.error('Missing DOM element #overallDiv after retries.');
        return;
      }
    }

    // Proceed with plotting
    this.plotOverallDataByLicensor();
  }

  /**
   * Plot the overall timeline based on license data.
   */
  plotOverallDataByLicensor(): void {
    const plotDiv = document.getElementById('overallDiv');
    if (!plotDiv) {
        console.error('No DOM element with id "overallDiv" exists.');
        return;
    }

    if (!this.groupedLicenseData || this.groupedLicenseData.length === 0) {
        console.warn('No license data available for the overall plot.');
        Plotly.purge(plotDiv);
        return;
    }

    const categories = ['_2G', '_3G', '_4G', '_5G', '_6G', 'wifi'];
    const data: any[] = [];
    const techColorMap = new Map<string, string>();
    const licenseeSet = new Set<string>();
    const usedColors = new Set<string>();
    let colorIndex = 0;

    const colorPalette = [
        '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
        '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
    ];

    const generateDistinctColor = (): string => {
        const hueStep = 360 / 15;
        const hue = (colorIndex * hueStep) % 360;
        const lightness = 50 + ((colorIndex % 2) * 10);
        const saturation = 70;
        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        colorIndex++;
        if (usedColors.has(color)) return generateDistinctColor();
        usedColors.add(color);
        return color;
    };

    // Step 1: Collect all licensees and reverse their sorting
    this.groupedLicenseData.forEach((group) => {
        group.licenses.forEach((license: any) => {
            const truncatedLicensee =
                license.licensee?.length > 12
                    ? `${license.licensee.slice(0, 12)}...`
                    : license.licensee || 'Unknown';
            licenseeSet.add(truncatedLicensee);
        });
    });

    // Reverse sorting for licensee list
    const licenseeList = Array.from(licenseeSet).sort().reverse();

    // Step 2: Process licenses and map them to reversed Y-axis positions
    let earliestYear = Number.MAX_SAFE_INTEGER;
    let latestYear = Number.MIN_SAFE_INTEGER;

    this.groupedLicenseData.forEach((group) => {
        group.licenses.forEach((license: any) => {
            const techCombination =
                categories
                    .filter((category) => license[category]?.toUpperCase() === 'Y')
                    .map((category) => category.replace('_', '').toUpperCase())
                    .join(', ') || 'NO TECHNOLOGIES';

            if (!techColorMap.has(techCombination)) {
                const color = techCombination === 'NO TECHNOLOGIES'
                    ? '#9b9b9b'
                    : (
                        colorIndex < colorPalette.length
                            ? colorPalette[colorIndex++]
                            : generateDistinctColor()
                    );
                techColorMap.set(techCombination, color);
            }

            const color = techColorMap.get(techCombination)!;

            const { signed_date, expiration_date, licensee, mapping_id } = license;
            const signedYear = signed_date
                ? new Date(signed_date).getFullYear()
                : null;
            const expirationYear = expiration_date
                ? new Date(expiration_date).getFullYear()
                : null;

            if (signedYear) earliestYear = Math.min(earliestYear, signedYear);
            if (expirationYear) latestYear = Math.max(latestYear, expirationYear);

            const truncatedLicensee =
                licensee?.length > 12 ? `${licensee.slice(0, 12)}...` : licensee || 'Unknown';
            const yPosition = licenseeList.indexOf(truncatedLicensee);

            let xData: (string | null)[] = [];
            let yData: (number | null)[] = [];
            let textData: (string | null)[] = [];
            let lineDash = 'solid';
            let markerSymbol = 'circle';
            let markerOpacity = [1, 1];

            const hoverText = `
                Licensee: ${licensee || 'N/A'}<br>
                Signed: ${signed_date || 'Not Available'}<br>
                Expiration: ${expiration_date || 'Not Available'}<br>
                Technologies: ${techCombination}
            `;

            if (mapping_id?.startsWith('X-')) {
                markerSymbol = 'diamond';
                xData = signedYear ? [`${signedYear}-01-01`] : [];
                yData = signedYear ? [yPosition] : [];
                textData = [hoverText];
                data.push({
                    x: xData,
                    y: yData,
                    type: 'scatter',
                    mode: 'markers',
                    marker: {
                        symbol: markerSymbol,
                        size: 5,
                        color,
                        line: {
                            color: 'black',
                            width: 1,
                        },
                    },
                    text: textData,
                    hoverinfo: 'text',
                    name: techCombination,
                    legendgroup: techCombination,
                    showlegend: false,
                });
                return;
            }

            if (signedYear && expirationYear) {
                xData = [`${signedYear}-01-01`, `${expirationYear}-01-01`, null];
                yData = [yPosition, yPosition, null];
                textData = [hoverText, hoverText, null];
                lineDash = 'solid';
            } else if (!signedYear && expirationYear) {
                const fakeSignedYear = expirationYear - 1;
                xData = [`${fakeSignedYear}-01-01`, `${expirationYear}-01-01`, null];
                yData = [yPosition, yPosition, null];
                textData = ['', hoverText, null];
                lineDash = 'dot';
                markerOpacity = [0, 1];
            } else if (signedYear && !expirationYear) {
                const fakeExpirationYear = signedYear + 1;
                xData = [`${signedYear}-01-01`, `${fakeExpirationYear}-01-01`, null];
                yData = [yPosition, yPosition, null];
                textData = [hoverText, '', null];
                lineDash = 'dot';
                markerOpacity = [1, 0];
            }

            data.push({
                x: xData,
                y: yData,
                type: 'scatter',
                mode: 'lines+markers',
                line: {
                    dash: lineDash,
                    color,
                    width: lineDash === 'dot' ? 2 : 2,
                },
                marker: {
                    symbol: markerSymbol,
                    size: 8,
                    color,
                    opacity: markerOpacity,
                },
                text: textData,
                hoverinfo: 'text',
                name: techCombination,
                legendgroup: techCombination,
                showlegend: false,
            });
        });
    });

    const heightPerLicensee = 30;
    const baseHeight = 600;
    const dynamicHeight = baseHeight + licenseeList.length * heightPerLicensee;

    const layout = {
        title: `Overall Timeline for Licensor: ${this.selectedLicensor}`,
        xaxis: {
            title: 'Year',
            type: 'date',
            automargin: true,
            tickmode: 'linear',
            dtick: 'M12',
            tickformat: '%Y',
            tickangle: -45,
            tickfont: { size: 10 },
            showgrid: true,
            zeroline: false,
        },
        yaxis: {
            title: 'Licensee',
            tickmode: 'array',
            tickvals: licenseeList.map((_, index) => index),
            ticktext: licenseeList,
            automargin: true,
            tickfont: { size: 10 },
            zeroline: false,

        },
        showlegend: true,
        legend: {
            itemclick: 'toggle',
            itemdoubleclick: 'toggleothers',
        },
        height: dynamicHeight,
        margin: {
            t: 40,
            l: 150,
            r: 40,
            b: 80,
        },
    };

    techColorMap.forEach((color, techCombination) => {
        data.push({
            x: [null],
            y: [null],
            type: 'scatter',
            mode: 'markers',
            marker: {
                symbol: 'square',
                size: 10,
                color,
            },
            name: techCombination,
            legendgroup: techCombination,
            showlegend: true,
            hoverinfo: 'none',
        });
    });

    Plotly.newPlot(plotDiv, data, layout)
        .then(() => console.log('Overall plot rendered successfully.'))
        .catch((error: any) => console.error('Error rendering plot:', error));
}


  /**
   * Show a fallback chart with only revenue bars, no payments.
   */
  private plotRevenueOnly(selectedLicensorRevenues: AnnualRevenue[]): void {
    const plotDiv = document.getElementById('licensorPaymentsPlot');
    if (!plotDiv) {
      console.error('No plotDiv for licensorPaymentsPlot found.');
      return;
    }

    // 1. Gather relevant years from the revenue array
    const yearsSet = new Set<number>();
    selectedLicensorRevenues.forEach((item) => {
      const year = typeof item.year === 'string' ? parseInt(item.year, 10) : item.year;
      if (!isNaN(year)) {
        yearsSet.add(year);
      }
    });
    const years = [...yearsSet].sort((a, b) => a - b);
    console.log('Years for Revenue Only Plot:', years);

    // 2. Convert them to numeric revenue
    const revenueData = years.map((yr) => {
      const revItem = selectedLicensorRevenues.find((r) => {
        const revYear = typeof r.year === 'string' ? parseInt(r.year, 10) : r.year;
        return revYear === yr;
      });
      return revItem?.licensing_revenue
        ? parseFloat(revItem.licensing_revenue.toString().replace(/,/g, ''))
        : 0;
    });
    console.log('Revenue Data for Revenue Only Plot:', revenueData);

    // 3. Create a single bar series with consistent grey color
    const revenueTrace = {
      x: years.map((year) => `${year}-01-01`), // Align x with 'date' type
      y: revenueData,
      type: 'bar',
      name: 'Licensing Revenue',
      marker: { color: this.GREY_COLOR }, // Consistent grey color
    };

    const layout = {
      title: `Licensing Revenues for ${this.selectedLicensor} (No Payments)`,
      barmode: 'stack',
      xaxis: {
        title: 'Year',
        type: 'date',
        tickvals: years.map((year) => `${year}-01-01`),
        ticktext: years.map(String),
        tickangle: -45,
        automargin: true,
        showgrid: true,
        gridcolor: '#e0e0e0',
        showline: false,
      },
      yaxis: {
        title: 'Revenue',
        tickformat: ',d',
        showgrid: true,
        gridcolor: '#e0e0e0',
        zeroline: false,
        showline: false,
        rangemode: 'nonnegative',
      },
      height: 600,
      margin: {
        t: 50,
        l: 200,
        r: 50,
        b: 200,
      },
    };

    console.warn('Displaying revenue-only chart for', this.selectedLicensor);
    Plotly.newPlot(plotDiv, [revenueTrace], layout).then(() => {
      console.log('Revenue-only plot rendered successfully.');
    }).catch((error: any) => {
      console.error('Error rendering revenue-only plot:', error);
    });
  }

  /**
   * Process data when payments exist and plot payments along with remaining revenues.
   * Also, alert if any year's payments exceed revenue.
   */
  processDataAndPlot(selectedLicensorRevenues: AnnualRevenue[]): void {
    this.licenseeData.clear();

    // 1. Calculate a unified range of years once, ensuring consistency
    let unifiedYears = this.calculateUnifiedYearRange(); // Ensure this returns a sorted array of unique years
    console.log('Original Unified Years:', unifiedYears);

    // 2. Exclude 0 from unifiedYears if present
    unifiedYears = unifiedYears.filter(year => year !== 0);
    console.log('Filtered Unified Years (No 0):', unifiedYears);

    const unifiedYearsStr = unifiedYears.map(String); // Convert to strings for Plotly

    // 3. Prepare revenue data aligned with unifiedYears
    const revenueData = unifiedYears.map((year) => {
      const revenueItem = selectedLicensorRevenues.find((rev) => {
        const revYear = typeof rev.year === 'string' ? parseInt(rev.year.slice(0, 4), 10) : rev.year;
        return revYear === year;
      });
      return revenueItem?.licensing_revenue
        ? parseFloat(revenueItem.licensing_revenue.toString().replace(/,/g, ''))
        : 0; // Fill missing years with 0
    });
    console.log('Revenue Data:', revenueData);

    // 4. Map payments to unifiedYears
    this.filteredPayments.forEach((item) => {
      const year = item.year
        ? parseInt(item.year.toString().slice(0, 4), 10)
        : null;

      const payment = this.computePaymentValue(item);

      // **IMPORTANT FIX**: Exclude year=0 here to prevent it from being added to licenseeData
      if (
        year !== null &&
        !Number.isNaN(year) &&
        isFinite(year) &&
        payment >= 0 &&
        year !== 0 // Exclude year=0
      ) {
        if (!this.licenseeData.has(item.licensee)) {
          this.licenseeData.set(item.licensee, []);
        }
        this.licenseeData.get(item.licensee)!.push({ year, payment });
      } else if (year === 0) {
        console.warn('Found payment with year = 0 and excluded it:', item);
      }
    });
    console.log('Licensee Data after Mapping:', Array.from(this.licenseeData.entries()));

    // 5. Create payment traces, ensuring all traces align with unifiedYears
    const paymentTraces = Array.from(this.licenseeData.entries()).map(
      ([licensee, data], index) => {
        const color = this.colorPalette[index % this.colorPalette.length];
        const yValues = unifiedYears.map(
          (yr) => data.find((entry) => entry.year === yr)?.payment || 0
        );

        return {
          x: unifiedYearsStr.map((year) => `${year}-01-01`), // Align x with 'date' type
          y: yValues,
          type: 'bar',
          name: licensee,
          marker: { color },
          visible: true, // Initially, all traces are visible
        };
      }
    );
    console.log('Payment Traces:', paymentTraces);

    // 6. Function to calculate Remaining Revenues based on visibility
    const calculateRemainingRevenues = (visibleTraces: boolean[]): number[] => {
      return revenueData.map((total, idx) => {
        const totalPayments = paymentTraces.reduce((sum, trace, traceIdx) => {
          if (visibleTraces[traceIdx]) {
            return sum + (trace.y![idx] || 0);
          }
          return sum;
        }, 0);
        return Math.max(0, total - totalPayments);
      });
    };

    // 7. Initial calculation of Remaining Revenues assuming all payment traces are visible
    const initialVisibility = paymentTraces.map(() => true);
    let remainingRevenues = calculateRemainingRevenues(initialVisibility);
    console.log('Initial Remaining Revenues:', remainingRevenues);

    // 8. Create the Remaining Revenue trace
    const remainingRevenueTrace = {
      x: unifiedYearsStr.map((year) => `${year}-01-01`), // Align x with 'date' type
      y: remainingRevenues,
      type: 'bar',
      name: 'Remaining Revenue',
      marker: { color: this.GREY_COLOR }, // Consistent grey color
      uid: 'remaining-revenue', // Unique identifier for easy reference
    };
    console.log('Remaining Revenue Trace:', remainingRevenueTrace);

    // 9. Combine all traces
    const traces = [...paymentTraces, remainingRevenueTrace];
    console.log('All Traces to Plot:', traces);

    // 10. Check for any year where payments exceed revenue
    const paymentSumsPerYear: number[] = unifiedYears.map((yr, idx) => {
      return paymentTraces.reduce((sum, trace) => sum + (trace.y[idx] || 0), 0);
    });

    const yearsExceedingRevenue: number[] = [];
    unifiedYears.forEach((yr, idx) => {
      if (paymentSumsPerYear[idx] > revenueData[idx]) {
        yearsExceedingRevenue.push(yr);
      }
    });

    if (yearsExceedingRevenue.length > 0) {
      const yearsList = yearsExceedingRevenue.join(', ');
      alert(`Alert: Payments exceed revenues in the following year(s): ${yearsList}`);
      console.warn(`Payments exceed revenues in the following year(s): ${yearsList}`);
    }

    const layout = {
      title: `Licensing Revenues for ${this.selectedLicensor}`,
      barmode: 'stack',
      xaxis: {
        title: 'Year',
        type: 'date', // Ensure 'date' type for alignment
        tickvals: unifiedYears.map((year) => `${year}-01-01`), // Align tickvals as dates
        ticktext: unifiedYears.map(String), // Ensure ticktext is string
        showgrid: true, // Keep gridlines for x-axis
        gridcolor: '#e0e0e0', // Set gridline color
        showline: false, // Hide the x-axis line
        automargin: true, // Prevent label overlap
        tickangle: -45, // Tilt x-axis labels for better readability
      },
      yaxis: {
        title: 'Amount',
        tickformat: ',d',
        showgrid: true, // Keep gridlines for y-axis
        gridcolor: '#e0e0e0', // Set gridline color
        zeroline: false, // Remove the y=0 line
        showline: false, // Hide the y-axis line
        rangemode: 'nonnegative', // Ensure no forced range including 0 unless data demands
        range: [
          Math.min(...revenueData.concat(...paymentTraces.map((t) => t.y)).filter((v) => v > 0)),
          Math.max(...revenueData),
        ], // Dynamic range based on data
      },
      height: 600,
      margin: {
        t: 50,  // Top margin
        l: 200, // Increased left margin to accommodate longer labels
        r: 50,  // Right margin
        b: 200,  // Increased bottom margin for x-axis label space
      },
    };

    console.log('Layout Configuration:', layout);

    // 11. Get the plot div
    const plotDiv = document.getElementById('licensorPaymentsPlot') as any;

    if (plotDiv) {
      // 12. Initial plot using Plotly.newPlot for better event handling
      Plotly.newPlot(plotDiv, traces, layout).then(() => {
        console.log('Payments and Revenues plot rendered successfully.');

        // 13. Flag to prevent recursive updates
        let isUpdating = false;

        // 14. Add event listener for toggling traces
        plotDiv.on('plotly_restyle', (eventData: any) => {
          if (isUpdating) return; // Prevent recursion

          // 15. Retrieve all current traces
          const allTraces = plotDiv.data;

          // 16. Identify the Remaining Revenue trace by UID
          const remainingRevenueIndex = allTraces.findIndex(
            (trace: any) => trace.uid === 'remaining-revenue'
          );

          if (remainingRevenueIndex === -1) {
            console.error('Remaining Revenue trace not found.');
            return;
          }

          // 17. Determine visibility of each payment trace
          const visibleTraces = paymentTraces.map((_, idx) => {
            const trace = allTraces[idx];
            return trace.visible === true || trace.visible === undefined;
          });

          console.log('Visible Traces:', visibleTraces);

          // 18. Recalculate Remaining Revenues based on visible traces
          const updatedRemainingRevenues = calculateRemainingRevenues(visibleTraces);
          console.log('Updated Remaining Revenues:', updatedRemainingRevenues);

          // 19. Update the Remaining Revenue trace using Plotly.restyle
          isUpdating = true; // Set flag to prevent recursion
          Plotly.restyle(plotDiv, { y: [updatedRemainingRevenues] }, [remainingRevenueIndex])
            .then(() => {
              isUpdating = false; // Reset flag after update
            })
            .catch((err: any) => {
              console.error('Error updating Remaining Revenue trace:', err);
              isUpdating = false;
            });
        });
      }).catch((error: any) => {
        console.error('Error rendering Payments and Revenues plot:', error);
      });
    }
  }

  /**
   * Group license data by mapping_id.
   */
  groupLicenseData(data: any[]): any[] {
    const groupedMap = new Map<string, any[]>();

    data.forEach((item) => {
      const mappingId = item.mapping_id || 'Unmapped'; // Fallback for missing mapping_id
      if (!groupedMap.has(mappingId)) {
        groupedMap.set(mappingId, []);
      }
      groupedMap.get(mappingId)?.push(item);
    });

    return Array.from(groupedMap.entries()).map(([mappingId, licenses]) => ({
      mappingId,
      licenses,
      isExpanded: false,
    }));
  }

  /**
   * Calculate a unified range of years from both license data and payment data.
   */
  calculateUnifiedYearRange(): number[] {
    let earliestYear = Number.MAX_SAFE_INTEGER;
    let latestYear = Number.MIN_SAFE_INTEGER;

    // Check years in grouped license data
    this.groupedLicenseData.forEach((group) => {
      group.licenses.forEach((license: any) => {
        const signedYear = license.signed_date
          ? parseInt(license.signed_date.slice(0, 4), 10)
          : null;
        const expirationYear = license.expiration_date
          ? parseInt(license.expiration_date.slice(0, 4), 10)
          : null;

        if (signedYear !== null) {
          earliestYear = Math.min(earliestYear, signedYear);
        }
        if (expirationYear !== null) {
          latestYear = Math.max(latestYear, expirationYear);
        }
      });
    });

    // Check years in filtered payment data
    this.filteredPayments.forEach((item) => {
      const year = item.year
        ? parseInt(item.year.toString().slice(0, 4), 10)
        : null;
      if (year !== null) {
        earliestYear = Math.min(earliestYear, year);
        latestYear = Math.max(latestYear, year);
      }
    });

    // Handle cases where no valid years are found
    if (earliestYear === Number.MAX_SAFE_INTEGER || latestYear === Number.MIN_SAFE_INTEGER) {
      console.warn('No valid years found in data. Defaulting to current year.');
      const currentYear = new Date().getFullYear();
      earliestYear = currentYear;
      latestYear = currentYear;
    }

    return Array.from(
      { length: latestYear - earliestYear + 1 },
      (_, i) => earliestYear + i
    );
  }

  // Grabs a fresh copy of annual revenues for the currently selected licensor
  getSelectedLicensorRevenues(): AnnualRevenue[] {
    const normalizedSelectedLicensor = this.normalizeLicensorName(this.selectedLicensor);
    const revenues = this.annualRevenues.filter(
      (item) => this.normalizeLicensorName(item.licensor) === normalizedSelectedLicensor
    );
    console.log('Selected Licensor Revenues:', revenues);
    return revenues;
  }
}
