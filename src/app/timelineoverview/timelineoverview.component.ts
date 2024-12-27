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
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b',
    '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
  ];

  constructor(
    private connectionService: ConnectionService,
    private paymentConnection: PaymentConnection
  ) {}

  ngOnInit(): void {
    this.fetchLicensors();
    this.fetchPayments();
    this.groupedLicenseData$.subscribe({
      next: (data) => {
        this.groupedLicenseData = data;
        this.plotOverallDataByLicensor(); // Plot data for the timeline when grouped data changes
      },
      error: (error) => console.error('Error in groupedLicenseData subscription:', error),
    });
    this.loadPlotlyScript()
      .then(() => console.log('Plotly.js script loaded successfully'))
      .catch((error) => console.error('Error loading Plotly.js script:', error));
  }

  ngAfterViewInit(): void {
    this.plotOverallDataByLicensor();
  }

  fetchLicensors(): void {
    this.paymentConnection.getAnnualRevenues().subscribe((data) => {
      this.annualRevenues = data;

      // Extract licensors from annual revenues data
      this.licensors = Array.from(new Set(data.map((item) => item.licensor))).filter(Boolean);

      // Sort licensors alphabetically for better UX
      this.licensors.sort();
      console.log('Licensors from annual revenues:', this.licensors);
    });
  }


  fetchPayments(): void {
    this.paymentConnection.getPayments().subscribe((data: any[]) => {
      this.paymentData = data;
    });
  }

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

  plotOverallDataByLicensor(): void {
    const plotDiv = document.getElementById('overallDiv');
    if (!plotDiv) {
      console.error('No DOM element with id "overallDiv" exists.');
      return;
    }

    const data: any[] = [];
    const idToColor: Map<string, string> = new Map();
    const staticColors: string[] = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'];

    const getColorForMappingId = (mapping_id: string): string => {
      if (!idToColor.has(mapping_id)) {
        const color = staticColors[idToColor.size % staticColors.length];
        idToColor.set(mapping_id, color);
      }
      return idToColor.get(mapping_id) || '#000000';
    };

    this.groupedLicenseData.forEach((group) => {
      const { signed, expiration } = this.getGroupDates(group);
      const mapping_id = group.mapping_id;
      const color = getColorForMappingId(mapping_id);
      const licensee = group.licenses[0]?.licensee || 'Unknown';
      const hoverText = `Mapping ID: ${mapping_id}<br>Licensee: ${licensee}<br>Signed: ${signed || '?'}<br>Expiration: ${expiration || '?'}`;

      if (signed && expiration) {
        data.push({
          x: [signed, expiration],
          y: [licensee, licensee],
          type: 'scatter',
          mode: 'lines+markers',
          line: { color },
          marker: { size: 8 },
          text: [hoverText, hoverText],
          hoverinfo: 'text',
          name: licensee,
        });
      }
    });

    const layout = {
      title: `Licensor Timeline: ${this.selectedLicensor}`,
      xaxis: { title: 'Date', type: 'date' },
      yaxis: { title: 'Licensee', automargin: true },
    };

    Plotly.newPlot(plotDiv, data, layout);
  }
onLicensorSelect(): void {
  if (!this.selectedLicensor) {
    console.warn('No licensor selected.');
    return;
  }

  console.log(`Selected Licensor: ${this.selectedLicensor}`);

  // Fetch all required data and ensure synchronization
  Promise.all([
    this.filterAndGroupDataForLicensor(),
    this.fetchPayments()
  ])
    .then(() => {
      const normalizedSelectedLicensor = normalizeLicensorName(this.selectedLicensor);

      const selectedLicensorRevenues = this.annualRevenues.filter(
        (item) => normalizeLicensorName(item.licensor) === normalizedSelectedLicensor
      );

      this.processDataAndPlot(selectedLicensorRevenues); // Process and plot revenues
    })
    .catch((error) => console.error('Error fetching data:', error));
}

  getGroupDates(group: any): { signed: string | null; expiration: string | null } {
    const signedDates = group.licenses.map((l: any) => l.signed_date).filter(Boolean);
    const expirationDates = group.licenses.map((l: any) => l.expiration_date).filter(Boolean);

    const signed = signedDates.length ? signedDates[0] : null;
    const expiration = expirationDates.length ? expirationDates[0] : null;

    return { signed, expiration };
  }
// Define groupLicenseData function
groupLicenseData(data: any[]): any[] {
  const groupedMap = new Map<string, any[]>();

  data.forEach((item) => {
    const mapping_id = item.mapping_id || 'In Progress';
    if (!groupedMap.has(mapping_id)) {
      groupedMap.set(mapping_id, []);
    }
    groupedMap.get(mapping_id)?.push(item);
  });

  return Array.from(groupedMap.entries()).map(([mapping_id, licenses]) => ({
    mapping_id,
    licenses,
    isExpanded: false,
  }));
}

  filterAndGroupDataForLicensor(): void {
    if (!this.selectedLicensor) {
      console.warn('No licensor selected.');
      return;
    }

    this.connectionService.getDataByLicensor(this.selectedLicensor).subscribe(
      (data) => {
        const licensorFilteredData = data.filter((license) => license.licensor === this.selectedLicensor);
        const groupedData = this.groupLicenseData(licensorFilteredData);
        this.groupedLicenseDataSource.next(groupedData);
      },
      (error) => console.error('Error fetching data for selected licensor:', error)
    );
  }

  onLicensorChange(): void {
    this.filterAndGroupDataForLicensor();

    if (!this.selectedLicensor) return;

    const normalizedSelectedLicensor = normalizeLicensorName(this.selectedLicensor);

    this.filteredPayments = this.paymentData.filter(
      (item) => normalizeLicensorName(item.licensor) === normalizedSelectedLicensor && item.adv_eq_type === 'TPY'
    );

    const selectedLicensorRevenues = this.annualRevenues.filter(
      (item) => normalizeLicensorName(item.licensor) === normalizedSelectedLicensor
    );

    this.processDataAndPlot(selectedLicensorRevenues);
  }

  processDataAndPlot(selectedLicensorRevenues: any[]): void {
    this.licenseeData.clear();

    if (this.filteredPayments.length === 0) {
      console.warn('No payments found for selected licensor.');
    }

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

    const revenueData = years.map((year) => {
      const revenueItem = selectedLicensorRevenues.find(
        (item) => (typeof item.year === 'string' ? parseInt(item.year, 10) : item.year) === year
      );
      return revenueItem?.licensing_revenue ? parseFloat(revenueItem.licensing_revenue.toString().replace(/,/g, '')) : 0;
    });

    const paymentTraces = Array.from(this.licenseeData.entries()).map(
      ([licensee, data], index) => {
        const color = this.colorPalette[index % this.colorPalette.length];
        const yValues = years.map((year) => data.find((entry) => entry.year === year)?.payment || 0);
        return {
          x: years,
          y: yValues,
          type: 'bar',
          name: licensee,
          marker: { color },
        };
      }
    );

    const totalPaymentsPerYear = years.map((year) => {
      return paymentTraces.reduce((sum, trace) => {
        const value = trace.y![years.indexOf(year)];
        return sum + (typeof value === 'number' ? value : 0);
      }, 0);
    });

    const remainingRevenue = years.map((year, index) => {
      const totalRevenue = revenueData[index];
      const totalPayments = totalPaymentsPerYear[index];
      return Math.max(0, totalRevenue - totalPayments);
    });

    const remainingRevenueTrace = {
      x: years,
      y: remainingRevenue,
      type: 'bar',
      name: 'Remaining Revenue',
      marker: { color: 'lightgrey' },
      hovertemplate: `
        <b>Year:</b> %{x}<br>
        <b>Remaining Revenue:</b> %{y}<br>
        <b>Licensing Revenue:</b> %{customdata} <extra></extra>
      `,
      customdata: revenueData,
    };

    const traces = [...paymentTraces, remainingRevenueTrace];

    const layout = {
      title: `Licensing Revenues for ${this.selectedLicensor}`,
      barmode: 'stack',
      xaxis: { title: 'Year', type: 'category' },
      yaxis: {
        title: 'Amount',
        tickformat: ',d',
      },
      height: 600,
    };

    const plotDiv = document.getElementById('licensorPaymentsPlot');
    if (plotDiv) {
      Plotly.react(plotDiv, traces, layout);
    }
  }
}

function normalizeLicensorName(name: string): string {
  return name.trim().toLowerCase().replace(/[^\w\s]/gi, '');
}
