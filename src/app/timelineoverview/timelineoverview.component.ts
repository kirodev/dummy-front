import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConnectionService } from '../connection.service';
import { PaymentConnection } from '../payment-connection.service';
declare var Plotly: any;

interface PaymentEntry {
  year: number;
  payment: number;
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
  paymentData: any[] = [];
  annualRevenues: any[] = [];
  filteredPayments: any[] = [];
  licenseeData: Map<string, PaymentEntry[]> = new Map();

  colorPalette: string[] = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728',
    '#9467bd', '#8c564b', '#e377c2', '#7f7f7f',
    '#bcbd22', '#17becf',
  ];

  constructor(
    private connectionService: ConnectionService,
    private paymentConnection: PaymentConnection
  ) {}

  // ---------------- HELPER FUNCTIONS ----------------

  /**
   * If `eq_type` is "TPY" and payment_amount is valid, use that.
   * Else if eq_type is empty/null, and adv_eq_type is "TPY", use results.
   * Otherwise, returns 0.
   */
  private computePaymentValue(item: any): number {
    const eqType = item.eq_type?.trim().toUpperCase() || '';
    const advEqType = item.adv_eq_type?.trim().toUpperCase() || '';

    // eq_type is 'TPY' and we have a valid payment_amount?
    if (eqType === 'TPY' && item.payment_amount != null && !isNaN(parseFloat(item.payment_amount))) {
      return parseFloat(item.payment_amount);
    }
    // eq_type is empty or null, but adv_eq_type is 'TPY' and we have valid results?
    else if (!eqType && advEqType === 'TPY' && item.results != null && !isNaN(parseFloat(item.results))) {
      return parseFloat(item.results);
    }
    // Default to 0 if neither condition is met
    return 0;
  }

  /**
   * Filter out any payment items that don't satisfy our eq_type/adv_eq_type logic.
   */
  private filterPayments(data: any[]): any[] {
    return data.filter((item) => {
      const hasValidDates = item.signed_date || item.expiration_date; // At least one date must be present
      const hasLicensee = !!item.licensee; // Licensee must exist
      const hasLicensor = !!item.licensor; // Licensor must exist

      // Include items with valid dates and licensors/licensees
      return hasValidDates && hasLicensee && hasLicensor;
    });
  }



  // ---------------- LIFECYCLE HOOKS ----------------

  ngOnInit(): void {
    this.fetchLicensors();
    this.fetchPayments();
    this.groupedLicenseData$.subscribe({
      next: (data) => {
        this.groupedLicenseData = data;
        this.plotOverallDataByLicensor(); // Plot data for the timeline
      },
      error: (error) => console.error('Error in groupedLicenseData subscription:', error),
    });

    this.loadPlotlyScript()
      .then(() => {
        console.log('Plotly.js script loaded successfully');
        // Plot initial data if available
        this.initializePlots();
      })
      .catch((error) => console.error('Error loading Plotly.js script:', error));
  }


  ngAfterViewInit(): void {
    this.initializePlots();
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
      this.processDataAndPlot(selectedLicensorRevenues);
    }
  }


  fetchLicensors(): void {
    this.paymentConnection.getAnnualRevenues().subscribe((data) => {
      this.annualRevenues = data;
      this.licensors = Array.from(new Set(data.map((item) => item.licensor))).filter(Boolean);
      this.licensors.sort();
      console.log('Licensors from annual revenues:', this.licensors);
    });
  }

  /**
   * This returns a Promise just in case you want to chain it.
   */
  fetchPayments(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.paymentConnection.getPayments().subscribe({
        next: (data) => {
          this.paymentData = data;
          // Use our new `filterPayments` logic
          this.filteredPayments = this.filterPayments(this.paymentData);
          resolve(true);
        },
        error: (err) => reject(err),
      });
    });
  }

  filterAndGroupDataForLicensor(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.connectionService.getDataByLicensor(this.selectedLicensor).subscribe({
        next: (data) => {
          const licensorFilteredData = data.filter(
            (license) => license.licensor === this.selectedLicensor
          );
          const groupedData = this.groupLicenseData(licensorFilteredData);
          this.groupedLicenseDataSource.next(groupedData);
          resolve(true);
        },
        error: (err) => reject(err),
      });
    });
  }

  // ---------------- EVENT HANDLERS ----------------

  /**
   * Called when licensor changes in the dropdown,
   * waits for fresh data, then filters and plots.
   */
  onLicensorChange(): void {
    if (!this.selectedLicensor) {
      console.warn('No licensor selected');
      return;
    }
    console.log('Annual Revenues:', this.annualRevenues);
    const blackberryRevenues = this.annualRevenues.filter(item => normalizeLicensorName(item.licensor) === 'blackberry limited');
    console.log('Revenues for BlackBerry:', blackberryRevenues);

    this.connectionService.getDataByLicensor(this.selectedLicensor).subscribe({
      next: (data) => {
        // 1) Filter & group the licensor data (for timeline, if desired)
        const licensorFilteredData = data.filter(
          (license) => license.licensor === this.selectedLicensor
        );
        const groupedData = this.groupLicenseData(licensorFilteredData);
        this.groupedLicenseDataSource.next(groupedData);

        // 2) Filter payment data for the selected licensor
        const normalizedName = normalizeLicensorName(this.selectedLicensor);
        this.filteredPayments = this.paymentData.filter((item) => {
          return (
            normalizeLicensorName(item.licensor) === normalizedName &&
            this.computePaymentValue(item) > 0
          );
        });

        // 3) Filter revenues for the selected licensor
        const selectedLicensorRevenues = this.annualRevenues.filter(
          (item) => normalizeLicensorName(item.licensor) === normalizedName
        );

        // 4) Plot the “payments + remaining revenue” bar chart
        this.processDataAndPlot(selectedLicensorRevenues);

        // 5) Optionally, only plot the timeline if the <div id="overallDiv"> is present
        const overallDiv = document.getElementById('overallDiv');
        if (overallDiv) {
          this.plotOverallDataByLicensor();
        } else {
          console.warn('No #overallDiv found, skipping timeline plot.');
        }
      },
      error: (err) => {
        console.error('Error fetching data for selected licensor:', err);
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
        const normalizedSelectedLicensor = normalizeLicensorName(this.selectedLicensor);

        // Re-filter the newly fetched payments
        this.filteredPayments = this.paymentData.filter((item) => {
          return (
            normalizeLicensorName(item.licensor) === normalizedSelectedLicensor &&
            this.computePaymentValue(item) > 0
          );
        });

        const selectedLicensorRevenues = this.annualRevenues.filter(
          (item) => normalizeLicensorName(item.licensor) === normalizedSelectedLicensor
        );

        this.processDataAndPlot(selectedLicensorRevenues);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }

  // ---------------- PLOTTING LOGIC ----------------

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

plotOverallDataByLicensor(): void {
  const plotDiv = document.getElementById('overallDiv');
  if (!plotDiv) {
    console.error('No DOM element with id "overallDiv" exists.');
    return;
  }

  const data: any[] = [];
  const categories = ['_2G', '_3G', '_4G', '_5G', '_6G', 'wifi'];
  const plottedMappingIds = new Set<string>(); // Track already plotted `mapping_id`s
  const techCombinationsSet = new Set<string>(); // To track unique combinations

  // Aggregate records by mapping_id
  const aggregatedData = new Map<string, any>();
  let earliestYear = Number.MAX_SAFE_INTEGER;
  let latestYear = Number.MIN_SAFE_INTEGER;

  this.groupedLicenseData.forEach((group) => {
    group.licenses.forEach((license: any) => {
      const { mapping_id, signed_date, expiration_date } = license;

      if (!mapping_id) {
        console.warn('Skipping license with missing mapping_id:', license);
        return;
      }

      // Calculate the earliest and latest years for the axis
      if (signed_date) {
        const year = new Date(signed_date).getFullYear();
        earliestYear = Math.min(earliestYear, year);
      }
      if (expiration_date) {
        const year = new Date(expiration_date).getFullYear();
        latestYear = Math.max(latestYear, year);
      }

      // Initialize or update aggregated record
      if (!aggregatedData.has(mapping_id)) {
        aggregatedData.set(mapping_id, {
          mapping_id,
          earliestSignedDate: signed_date,
          latestExpirationDate: expiration_date,
          technologies: new Set<string>(), // Use Set to prevent duplicates
          licensee: license.licensee, // Use any licensee for labeling
        });
      } else {
        const agg = aggregatedData.get(mapping_id);
        agg.earliestSignedDate = this.getEarliestDate(agg.earliestSignedDate, signed_date);
        agg.latestExpirationDate = this.getLatestDate(agg.latestExpirationDate, expiration_date);
        categories.forEach((category) => {
          if (license[category]?.toUpperCase() === 'Y') {
            agg.technologies.add(category.replace('_', '').toUpperCase());
          }
        });
      }
    });
  });

  // Plot aggregated data
  aggregatedData.forEach((agg) => {
    if (plottedMappingIds.has(agg.mapping_id)) {
      return; // Skip if already plotted
    }
    plottedMappingIds.add(agg.mapping_id); // Mark as plotted

    const techCombination = Array.from(agg.technologies).join(', ') || 'NO TECHNOLOGIES'; // Fallback label
    techCombinationsSet.add(techCombination);

    const color = this.colorPalette[data.length % this.colorPalette.length];
    const hoverText = `
      Mapping ID: ${agg.mapping_id}<br>
      Licensee: ${agg.licensee || 'N/A'}<br>
      Signed: ${agg.earliestSignedDate || 'Not Available'}<br>
      Expiration: ${agg.latestExpirationDate || 'Not Available'}<br>
      Technologies: ${techCombination}
    `;

    if (agg.earliestSignedDate && agg.latestExpirationDate) {
      // Plot line + marker trace for licenses with both signed and expiration dates
      data.push({
        x: [agg.earliestSignedDate, agg.latestExpirationDate],
        y: [agg.licensee, agg.licensee],
        type: 'scatter',
        mode: 'lines+markers',
        line: { color },
        marker: { size: 8 },
        text: [hoverText, hoverText],
        hoverinfo: 'text',
        name: techCombination, // Use combination as legend label
        showlegend: !data.some((d) => d.name === techCombination), // Show legend only once per combination
      });
    } else {
      // Plot marker for licenses with only one date (either signed or expiration)
      const singleDate = agg.earliestSignedDate || agg.latestExpirationDate;
      if (singleDate) {
        data.push({
          x: [singleDate],
          y: [agg.licensee],
          type: 'scatter',
          mode: 'markers',
          marker: { size: 8, color },
          text: [hoverText],
          hoverinfo: 'text',
          name: techCombination, // Use combination as legend label
          showlegend: !data.some((d) => d.name === techCombination), // Show legend only once per combination
        });
      }
    }
  });

  // Dynamically calculate plot height based on the number of unique licensees
  const numLicensees = new Set(
    this.groupedLicenseData.flatMap((group) =>
      group.licenses.map((license: any) => license.licensee)
    )
  ).size;
  const baseHeight = 200; // Base height for the plot
  const additionalHeightPerLicensee = 30; // Height added per licensee
  const plotHeight = baseHeight + numLicensees * additionalHeightPerLicensee;

  // Define a range of years from the earliest to the latest
  const yearRange = [];
  for (let year = earliestYear; year <= latestYear; year++) {
    yearRange.push(year.toString());
  }

  const layout = {
    title: `Overall Timeline for Licensor: ${this.selectedLicensor}`,
    xaxis: {
      title: 'Date',
      type: 'date',
      automargin: true,
      tickvals: yearRange.map((year) => `${year}-01-01`), // Use January 1st of each year
      ticktext: yearRange, // Show only the year
    },
    yaxis: { title: 'Licensee', automargin: true },
    showlegend: true,
    height: plotHeight, // Dynamically set the height
  };

  console.log('Data for Plot:', data);

  if (data.length === 0) {
    console.warn('No data available for plotting.');
  }

  Plotly.newPlot(plotDiv, data, layout);
}

// Helper function to find the earliest date
getEarliestDate(date1: string | null, date2: string | null): string | null {
  if (!date1) return date2;
  if (!date2) return date1;
  return new Date(date1) < new Date(date2) ? date1 : date2;
}

// Helper function to find the latest date
getLatestDate(date1: string | null, date2: string | null): string | null {
  if (!date1) return date2;
  if (!date2) return date1;
  return new Date(date1) > new Date(date2) ? date1 : date2;
}






  // Grabs a fresh copy of annual revenues for the currently selected licensor
  getSelectedLicensorRevenues(): any[] {
    const normalizedSelectedLicensor = normalizeLicensorName(this.selectedLicensor);
    const revenues = this.annualRevenues.filter(
      (item) => normalizeLicensorName(item.licensor) === normalizedSelectedLicensor
    );
    console.log('Selected Licensor Revenues:', revenues);
    return revenues;
  }

  /**
   * Show a fallback chart with only revenue bars, no payments.
   */
  private plotRevenueOnly(selectedLicensorRevenues: any[]): void {
    const plotDiv = document.getElementById('licensorPaymentsPlot');
    if (!plotDiv) {
      console.error('No plotDiv for licensorPaymentsPlot found.');
      return;
    }

    // 1) Gather relevant years from the revenue array
    const yearsSet = new Set<number>();
    selectedLicensorRevenues.forEach((item) => {
      const year = typeof item.year === 'string' ? parseInt(item.year, 10) : item.year;
      if (!isNaN(year)) {
        yearsSet.add(year);
      }
    });
    const years = [...yearsSet].sort((a, b) => a - b);

    // 2) Convert them to numeric revenue
    const revenueData = years.map((yr) => {
      const revItem = selectedLicensorRevenues.find((r) => {
        const revYear = typeof r.year === 'string' ? parseInt(r.year, 10) : r.year;
        return revYear === yr;
      });
      return revItem?.licensing_revenue
        ? parseFloat(revItem.licensing_revenue.toString().replace(/,/g, ''))
        : 0;
    });

    // 3) Create a single bar series
    const revenueTrace = {
      x: years,
      y: revenueData,
      type: 'bar',
      name: 'Licensing Revenue (No Payments)',
      marker: { color: '#ff7f0e' },
    };

    const layout = {
      title: `Licensing Revenues for ${this.selectedLicensor} (No Payments)`,
      xaxis: { title: 'Year', type: 'category' },
      yaxis: { title: 'Revenue', tickformat: ',d' },
      height: 600,
    };

    console.warn('Displaying revenue-only chart for', this.selectedLicensor);
    Plotly.newPlot(plotDiv, [revenueTrace], layout);
  }

processDataAndPlot(selectedLicensorRevenues: any[]): void {
  this.licenseeData.clear();

  // Add licensee data
  this.filteredPayments.forEach((item) => {
    const year =
      typeof item.year === 'string' ? parseInt(item.year, 10) : item.year;

    const payment =
      item.payment_amount != null && !isNaN(parseFloat(item.payment_amount))
        ? parseFloat(item.payment_amount)
        : (item.adv_eq_type?.trim().toUpperCase() === 'TPY' ||
            item.eq_type?.trim().toUpperCase() === 'TPY') &&
          item.results != null &&
          !isNaN(parseFloat(item.results))
        ? parseFloat(item.results)
        : 0;

    if (!Number.isNaN(year) && isFinite(year) && payment >= 0) {
      if (!this.licenseeData.has(item.licensee)) {
        this.licenseeData.set(item.licensee, []);
      }
      this.licenseeData.get(item.licensee)!.push({ year, payment });
    }
  });

  const yearsSet = new Set<number>();
  this.licenseeData.forEach((data) =>
    data.forEach((entry) => yearsSet.add(entry.year))
  );

  selectedLicensorRevenues.forEach((item) => {
    const year =
      typeof item.year === 'string' ? parseInt(item.year, 10) : item.year;
    if (!isNaN(year)) {
      yearsSet.add(year);
    }
  });

  const years = Array.from(yearsSet).sort((a, b) => a - b);

  const revenueData = years.map((year) => {
    const revenueItem = selectedLicensorRevenues.find((rev) => {
      const revYear =
        typeof rev.year === 'string' ? parseInt(rev.year, 10) : rev.year;
      return revYear === year;
    });
    return revenueItem?.licensing_revenue
      ? parseFloat(revenueItem.licensing_revenue.toString().replace(/,/g, ''))
      : 0;
  });

  const paymentTraces = Array.from(this.licenseeData.entries()).map(
    ([licensee, data], index) => {
      const color = this.colorPalette[index % this.colorPalette.length];
      const yValues = years.map(
        (yr) => data.find((entry) => entry.year === yr)?.payment || 0
      );

      return {
        x: years,
        y: yValues,
        type: 'bar',
        name: licensee,
        marker: { color },
      };
    }
  );

  const remainingRevenueTrace = {
    x: years,
    y: revenueData.map((total, idx) => {
      const totalPayments = paymentTraces.reduce(
        (sum, trace) => sum + (trace.y![idx] || 0),
        0
      );
      return Math.max(0, total - totalPayments);
    }),
    type: 'bar',
    name: 'Remaining Revenue',
    marker: { color: 'lightgrey' },
  };

  const traces = [...paymentTraces, remainingRevenueTrace];
  const layout = {
    title: `Licensing Revenues for ${this.selectedLicensor}`,
    barmode: 'stack',
    xaxis: { title: 'Year', type: 'category' },
    yaxis: { title: 'Amount', tickformat: ',d' },
    height: 600,
  };

  const plotDiv = document.getElementById('licensorPaymentsPlot') as any;

  if (plotDiv) {
    Plotly.react(plotDiv, traces, layout).then(() => {
      plotDiv.on('plotly_restyle', (eventData: any) => {
        const updatedTraces = plotDiv.data;
        const remainingRevenue = years.map((_, idx) => {
          const totalRevenue = revenueData[idx];
          let visibleSum = 0;

          updatedTraces.forEach((trace: any, traceIndex: number) => {
            // Check if the trace is not hidden
            if (traceIndex < updatedTraces.length - 1 && trace.visible !== 'legendonly') {
              visibleSum += trace.y[idx] || 0;
            }
          });

          return Math.max(0, totalRevenue - visibleSum);
        });

        // Update Remaining Revenue trace
        updatedTraces[updatedTraces.length - 1].y = remainingRevenue;

        // Redraw the plot
        Plotly.redraw(plotDiv);
      });
    });
  }
}




  // Group license data by mapping_id
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


}


// Normalizer
function normalizeLicensorName(name: string): string {
  return name.trim().toLowerCase().replace(/[^\w\s]/gi, '');
}
