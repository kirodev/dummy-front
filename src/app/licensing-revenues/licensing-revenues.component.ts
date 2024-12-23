import { Component, OnInit } from '@angular/core';
import { PaymentConnection } from '../payment-connection.service'; // Adjust import as needed
declare var Plotly: any;

interface PaymentEntry {
  year: number;
  payment: number;
}

@Component({
  selector: 'app-licensing-revenues',
  templateUrl: './licensing-revenues.component.html',
  styleUrls: ['./licensing-revenues.component.css'],
})
export class LicensingRevenuesComponent implements OnInit {
  licensors: string[] = [];
  selectedLicensor: string = '';
  paymentData: any[] = [];
  annualRevenues: any[] = [];
  filteredPayments: any[] = [];

  // Updated Map to store payment entries by licensee
  licenseeData: Map<string, PaymentEntry[]> = new Map();

  // Define a color palette for licensees
  colorPalette: string[] = [
    '#1f77b4', '#ff7f0e', '#2ca02c',
    '#d62728', '#9467bd', '#8c564b',
    '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
  ];

  // Store initial total revenue per year
  initialTotalRevenuePerYear: { [year: number]: number } = {};

  // Flag to prevent infinite loops in event listener
  private isUpdating: boolean = false;

  constructor(private paymentConnection: PaymentConnection) {}

  ngOnInit(): void {
    this.fetchLicensors();
    this.fetchPayments();
    this.loadPlotlyScript().then(() => {
      console.log('Plotly.js loaded successfully');
    }).catch(() => {
      console.error('Failed to load Plotly.js');
    });
  }

  /**
   * Fetch the list of licensors from the payment data.
   */
  fetchLicensors(): void {
    this.paymentConnection.getAnnualRevenues().subscribe((data: any[]) => {
      this.annualRevenues = data;
      // Extract unique licensors from annual revenues
      this.licensors = [...new Set(data.map((item) => item.licensor))];

      // Sort licensors alphabetically for better UX
      this.licensors.sort();

      console.log('Licensors from annual revenues:', this.licensors);
    });
  }
  fetchPayments(): void {
    this.paymentConnection.getPayments().subscribe((data: any[]) => {
      this.paymentData = data;

      // Log all fetched payments
      console.log('Fetched Payments:', this.paymentData);
    });
  }

  /**
   * Handler for when a licensor is selected.
   */
  onLicensorChange(): void {
    if (!this.selectedLicensor) return;

    console.log(`Selected Licensor: ${this.selectedLicensor}`);

    // Normalize selected licensor name for comparison
    const normalizedSelectedLicensor = normalizeLicensorName(this.selectedLicensor);

    // Filter payments for the selected licensor
    this.filteredPayments = this.paymentData.filter(
      (item) => normalizeLicensorName(item.licensor) === normalizedSelectedLicensor && item.adv_eq_type === 'TPY'
    );

    console.log('Filtered Payments:', this.filteredPayments);

    // Filter the annual revenues for the selected licensor
    const selectedLicensorRevenues = this.annualRevenues.filter(
      (item) => normalizeLicensorName(item.licensor) === normalizedSelectedLicensor
    );

    console.log('Selected Licensor Revenues:', selectedLicensorRevenues);

    // Call the method to process the data and plot it
    this.processDataAndPlot(selectedLicensorRevenues);
  }


  /**
   * Process the payment and revenue data, then plot using Plotly.
   */
  processDataAndPlot(selectedLicensorRevenues: any[]): void {
    // Clear existing data
    this.licenseeData.clear();

    if (this.filteredPayments.length === 0) {
      console.warn('No payments found for selected licensor.');
    }

    // Group payments by licensee and year
    this.filteredPayments.forEach((item) => {
      const year = typeof item.year === 'string' ? parseInt(item.year, 10) : item.year;
      const payment = item.payment_amount ?? item.results ?? 0;
      const licensee = item.licensee;

      if (!Number.isNaN(year) && isFinite(year) && isFinite(payment)) {
        if (!this.licenseeData.has(licensee)) {
          this.licenseeData.set(licensee, []);
        }
        this.licenseeData.get(licensee)!.push({ year, payment });
      }
    });

    // Extract unique and sorted years from both payments and revenues
    const yearsSet = new Set<number>();
    this.licenseeData.forEach((data) => {
      data.forEach((entry) => yearsSet.add(entry.year));
    });
    selectedLicensorRevenues.forEach((item) => {
      const year = typeof item.year === 'string' ? parseInt(item.year, 10) : item.year;
      if (!isNaN(year) && isFinite(year)) {
        yearsSet.add(year);
      }
    });
    const years = Array.from(yearsSet).sort((a, b) => a - b);

    // Prepare revenue data using the licensing_revenue column from annualRevenues
    const revenueData = years.map((year) => {
      const revenueItem = selectedLicensorRevenues.find(
        (item) => (typeof item.year === 'string' ? parseInt(item.year, 10) : item.year) === year
      );

      // Use licensing_revenue directly as it is
      const revenue = revenueItem?.licensing_revenue
        ? parseFloat(revenueItem.licensing_revenue.toString().replace(/,/g, '')) // Remove commas
        : 0;

      return revenue;
    });

    console.log('Using Licensing Revenue Data:', revenueData);

    // Create payment traces for each licensee
    const paymentTraces = Array.from(this.licenseeData.entries()).map(
      ([licensee, data], index) => {
        const color = this.colorPalette[index % this.colorPalette.length];
        const yValues = years.map(
          (year) => data.find((entry) => entry.year === year)?.payment || 0
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

    // Calculate total payments for each year
    const totalPaymentsPerYear = years.map((year) => {
      return paymentTraces.reduce((sum, trace) => {
        const value = trace.y![years.indexOf(year)]; // Get the payment value for this year
        return sum + (typeof value === 'number' ? value : 0);
      }, 0);
    });

    console.log('Total Payments Per Year:', totalPaymentsPerYear);

    // Calculate remaining revenue for each year: licensing_revenue - total payments
    const remainingRevenue = years.map((year, index) => {
      const totalRevenue = revenueData[index]; // Get the licensing_revenue for this year
      const totalPayments = totalPaymentsPerYear[index]; // Get the total payments for this year
      return Math.max(0, totalRevenue - totalPayments); // Calculate remaining revenue
    });

    console.log('Remaining Revenue:', remainingRevenue);

    // Create remaining revenue trace
    const remainingRevenueTrace = {
      x: years,
      y: remainingRevenue,  // Calculated remaining revenue
      type: 'bar',
      name: 'Remaining Revenue',
      marker: { color: 'lightgrey' },
      hovertemplate: `
        <b>Year:</b> %{x}<br>
        <b>Remaining Revenue:</b> %{y}<br>
        <b>Licensing Revenue:</b> %{customdata} <extra></extra>
      `,
      customdata: revenueData,  // Attach licensing revenue as custom data for hover
    };

    // Combine all traces (payment traces and licensing revenue trace)
    const traces = [...paymentTraces, remainingRevenueTrace];

    // Plot layout
    const layout = {
      title: `Licensing Revenues for ${this.selectedLicensor}`,
      barmode: 'stack', // Stack all bars
      xaxis: { title: 'Year', type: 'category' },
      yaxis: {
        title: 'Amount',
        tickformat: ',d',  // Full number format (no scientific notation)
      },
      height: 600,
    };

    // Render the plot
    const plotDiv = document.getElementById('licensorPaymentsPlot');
    if (plotDiv) {
      Plotly.react(plotDiv, traces, layout);
    }
  }



  /**
   * Helper method to load Plotly.js
   */
  loadPlotlyScript(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (typeof Plotly !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.plot.ly/plotly-2.25.2.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Plotly.js'));
      document.head.appendChild(script);
    });
  }
}
function normalizeLicensorName(name: string): string {
  return name.trim().toLowerCase().replace(/[^\w\s]/gi, ''); // Remove special characters
}
