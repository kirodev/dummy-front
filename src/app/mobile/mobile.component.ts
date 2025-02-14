// mobile.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CellSelectionService } from '../cell-selection-service.service';
import { ConnectionService } from '../connection.service';
import { PaymentConnection } from '../payment-connection.service';
import { CompanyTypeService, CompanyType } from '../company-type.service';
import { EquationsPaymentsService } from '../equations-payments.service';
import { SalesService } from '../sales-service.service';
declare var Plotly: any;

@Component({
  selector: 'app-mobile',
  templateUrl: './mobile.component.html',
  styleUrls: ['./mobile.component.css'],
})
export class MobileComponent implements OnInit {
  // Licensee and Licensor Data
  allLicensees: string[] = []; // Normalized all licensees
  filteredLicensees: string[] = []; // Normalized licensees after applying type and search filters
  licensors: string[] = [];
  isPopupVisible: boolean = false; // Tracks popup visibility
  popupText: string = ''; // Content to display in the popup
  selectedLicensor: string | null = null;
  selectedLicensee: string = '';
  // Mapping between normalized and original licensee names
  normalizedToOriginalLicenseeMap: Map<string, string> = new Map(); // New mapping

  // Table Data
  tableData: string[][] = [];
  filteredTableData: string[][] = [];

  // Fetched Data
  fetchedData: any[] = [];
  paymentsData: any[] = [];
  multiplePayments: any[] = [];
  multipleLicenses: any[] = [];

  // Search and Sorting
  searchTerm$ = new BehaviorSubject<string>('');
  searchTerm: string = '';
  sortOrder: 'default' | 'alphabetical' | 'count' = 'default'; // Initialize with 'default'
  typeFilter: 'include' | 'exclude' | 'all' = 'all'; // Initialize with 'all' (Others)
  startDate: string = '';
  endDate: string = '';
  companyTypes: CompanyType[] = [];
  licenseeTypeMap: Map<string, number> = new Map();
  isSideNavOpen: boolean = false;
  private originalLicensees: string[] = [];
  private originalTableData: string[][] = [];
  licensorRevenues: Map<string, number> = new Map(); // Store revenue data for licensors
  private originalLicensors: string[] = [];

  isDataReady: boolean = false;
  dateFilterType: 'None' | 'exactDate' | 'fullPeriod' | 'startDateInside' | 'endDateInside' | 'anyDateInside' = 'None';
  licensee!: string;

  constructor(
    private router: Router,
    private cellSelectionService: CellSelectionService,
    private connectionService: ConnectionService,
    private paymentConnection: PaymentConnection,
    private companyTypeService: CompanyTypeService,
    private equationsPaymentsService: EquationsPaymentsService,
    private route: ActivatedRoute,
    private salesService: SalesService
  ) {}

  licensorSortOrder: 'default' | 'alphabetical' | 'revenue' = 'default'; // Updated type

  ngOnInit(): void {
    this.isDataReady = false;
    this.loadPlotlyScript()
    .then(() => {
      console.log('Plotly.js script loaded successfully');
      if (this.salesList.length > 0) {
        this.plotSalesData();
      }
    })
    .catch((error) => {
      console.error('Error loading Plotly.js script:', error);
    });
    // Load saved filter state before fetching data
    this.loadFilterState();
    this.route.queryParams.subscribe(params => {
      this.selectedLicensee = params['licensee'] || '';
      if (this.selectedLicensee) {
        this.loadSalesData();
      }
    });
    // Fetch necessary data
    forkJoin({
      companyTypes: this.companyTypeService.getCompanyTypes(),
      licenseData: this.connectionService.getData(),
      payments: this.paymentConnection.getPayments(),
      multiplePayments: this.paymentConnection.getMultiplePayments(),
      multipleLicenses: this.connectionService.getMultipleLicenses(),
      annualRevenues: this.equationsPaymentsService.getAllAnnualRevenues(),
    }).subscribe({
      next: (response) => {
        this.handleFetchedData(response);

        // Apply sorting after data is fetched
        this.sortLicensors();
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
    });
  }

  loadPlotlyScript(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (typeof Plotly !== 'undefined') {
        resolve();
      } else {
        const scriptElement = document.createElement('script');
        scriptElement.src = 'https://cdn.plot.ly/plotly-2.25.2.min.js';
        scriptElement.type = 'text/javascript';
        scriptElement.onload = () => resolve();
        scriptElement.onerror = (event: Event | string) => reject(event);
        document.head.appendChild(scriptElement);
      }
    });
  }


   saveFilterState(): void {
    const filterState = {
      searchTerm: this.searchTerm,
      startDate: this.startDate,
      endDate: this.endDate,
      dateFilterType: this.dateFilterType,
      typeFilter: this.typeFilter,
      sortOrder: this.sortOrder,
      licensorSortOrder: this.licensorSortOrder, // Saving correctly here
    };
    localStorage.setItem('filterState', JSON.stringify(filterState));
  }



  private loadFilterState(): void {
    const savedFilterState = localStorage.getItem('filterState');
    if (savedFilterState) {
      const filterState = JSON.parse(savedFilterState);
      this.searchTerm = filterState.searchTerm || '';
      this.startDate = filterState.startDate || '';
      this.endDate = filterState.endDate || '';
      this.dateFilterType = filterState.dateFilterType || 'None';
      this.typeFilter = filterState.typeFilter || 'all';
      this.sortOrder = filterState.sortOrder || 'default';
      this.licensorSortOrder = filterState.licensorSortOrder || 'default'; // Restored correctly
    }
  }

  onLicensorSortOrderChange(): void {
    console.log('Licensor sort order changed to:', this.licensorSortOrder); // Debug
    this.sortLicensors(); // Apply sorting based on the new selection
    this.saveFilterState(); // Save the new sort order to localStorage
  }

  logout(): void {
    localStorage.removeItem('filterState'); // Clear saved filters
    localStorage.removeItem('unselectedCells'); // Clear any temporary cell selections
    console.log('User has logged out. Filters and states have been reset.');
    this.resetFilters(); // Ensure everything is in default state
  }

  /**
   * Handles the data fetched from multiple services and sets up the necessary table and filters.
   */
  private handleFetchedData(response: any): void {
    // Destructure response to access all fetched data
    const { companyTypes, licenseData, payments, multiplePayments, multipleLicenses, annualRevenues } = response;

    // Store fetched data
    this.companyTypes = companyTypes;
    this.fetchedData = licenseData;
    this.paymentsData = payments;
    this.multiplePayments = multiplePayments;
    this.multipleLicenses = multipleLicenses;

    // Map licensee types for filtering and sorting
    this.mapLicenseeTypes();

    // Process and store original licensors and licensees
    this.processLicensorsAndLicensees(licenseData, payments);
    this.originalLicensors = [...this.licensors]; // Store original licensor order

    // Process annual revenues for licensors
    this.fetchedLicensorsAndData(licenseData, annualRevenues);

    // Initialize the table and apply initial filters and sorting
    this.initializeTableData();
    this.applyFilters();
    this.sortLicensees(); // Sort licensees if needed
    this.sortLicensors(); // Sort licensors if needed

    // Indicate that data is ready for display
    this.isDataReady = true;
  }



  private processLicensorsAndLicensees(licenseData: any[], payments: any[]): void {
    this.licensors = [
      ...new Set([
        ...licenseData.map((item) => item.licensor),
        ...payments.map((item) => item.licensor),
      ]),
    ].filter((licensor) => licensor !== null);

    this.allLicensees = [
      ...new Set([
        ...licenseData.map((item) => item.licensee),
        ...payments.map((item) => item.licensee),
      ]),
    ].filter((licensee) => licensee !== 'Unknown' && licensee !== null);
  }


  /**
   * Sort licensors by the selected criteria or do nothing if default is selected.
   */

  /**
   * Toggle the visibility of the side nav.
   */
  toggleSideNav(): void {
    this.isSideNavOpen = !this.isSideNavOpen;
  }

  /**
   * Utility function to normalize licensee names.
   * Converts to lowercase, trims whitespace, and removes periods and commas.
   */
  normalizeName(name: string | null | undefined): string {
    return name
      ? name
          .trim()
          .toLowerCase()
          .replace(/[.,]/g, '') // Remove periods and commas
      : '';
  }

  /**
   * Map licensee names to their types for easy lookup.
   * Populates the `licenseeTypeMap`.
   */
  mapLicenseeTypes(): void {
    this.companyTypes.forEach((ct) => {
      const normalizedLicensee = this.normalizeName(ct.licensee);
      const typeNumber = Number(ct.type);
      if (normalizedLicensee && !isNaN(typeNumber)) {
        this.licenseeTypeMap.set(normalizedLicensee, typeNumber);
      }
    });
    console.log('Normalized Licensee Type Map:', this.licenseeTypeMap);
  }

  /**
   * Initialize table data by normalizing licensee names and setting up the table structure.
   */
  initializeTableData(): void {
    // Normalize all licensees and populate mapping
    this.normalizedToOriginalLicenseeMap.clear();
    this.allLicensees = this.allLicensees
      .map((originalLicensee) => {
        const normalizedLicensee = this.normalizeName(originalLicensee);
        if (normalizedLicensee) {
          this.normalizedToOriginalLicenseeMap.set(normalizedLicensee, originalLicensee);
          return normalizedLicensee;
        }
        return ''; // Return empty string for invalid licensee
      })
      .filter((licensee) => licensee !== ''); // Remove empty strings

    console.log('Normalized All Licensees:', this.allLicensees);

    // Initialize tableData with normalized licensees
    this.tableData = Array(this.licensors.length)
      .fill(null)
      .map(() => Array(this.allLicensees.length).fill('white'));

    // Apply data colors based on fetched data
    this.applyDataColors(this.fetchedData);
    this.applyDataColors(this.paymentsData);
    this.applyDataColors(this.multiplePayments);
    this.applyDataColors(this.multipleLicenses);

    // Capture the initial state of data
    this.originalLicensees = [...this.allLicensees];
    this.originalTableData = this.tableData.map((row) => [...row]);

    // Initialize filtered licensees and table data
    this.filteredLicensees = [...this.allLicensees];
    this.filteredTableData = this.tableData.map((row) => [...row]);
  }

  /**
   * Apply cell colors based on data.
   * Sets cells to 'green' if the licensee-licensor pair exists.
   */
  applyDataColors(data: any[]): void {
    data.forEach((dataItem) => {
      const licensorIndex = this.licensors.indexOf(dataItem.licensor);
      const licenseeNormalized = this.normalizeName(dataItem.licensee);
      const licenseeIndex = this.allLicensees.indexOf(licenseeNormalized);

      if (
        licensorIndex !== -1 &&
        licenseeIndex !== -1 &&
        licenseeNormalized !== ''
      ) {
        this.tableData[licensorIndex][licenseeIndex] = 'green';
      }
    });
  }

  /**
   * Apply all filters: type, search, and date.
   * The order ensures that type filter is applied first, followed by search and date filters.
   */


  /**
   * Filter licensees based on the select dropdown state (include or exclude Type 1 & 10).
   */
  filterByType(): void {
    if (this.typeFilter === 'include') {
      this.filteredLicensees = this.allLicensees.filter((licensee) => {
        const type = this.licenseeTypeMap.get(licensee);
        return type !== undefined && [1, 10].includes(type);
      });
    } else if (this.typeFilter === 'exclude') {
      this.filteredLicensees = this.allLicensees.filter((licensee) => {
        const type = this.licenseeTypeMap.get(licensee);
        return type === undefined || ![1, 10].includes(type);
      });
    } else {
      this.filteredLicensees = [...this.allLicensees];  // Reset to all licensees
    }

    console.log('Filtered licensees after type filter:', this.filteredLicensees);
  }





  filterBySearch(): void {
    const searchTermLower = this.searchTerm.toLowerCase();
    if (searchTermLower) {
      this.filteredLicensees = this.filteredLicensees.filter((licensee) => {
        const originalName = this.normalizedToOriginalLicenseeMap.get(licensee) || licensee;
        return originalName.toLowerCase().includes(searchTermLower);
      });
    }

    console.log('Filtered licensees after search filter:', this.filteredLicensees);
  }

  /**
   * Update table data based on filtered licensees.
   * Ensures that the table aligns with the current filtered and sorted licensees.
   */
  updateFilteredTableData(): void {
    this.filteredTableData = this.licensors.map((licensor) => {
      return this.filteredLicensees.map((licensee) => {
        const licensorIndex = this.originalLicensors.indexOf(licensor);
        const licenseeIndex = this.originalLicensees.indexOf(licensee);
        return this.originalTableData[licensorIndex][licenseeIndex];
      });
    });
    console.log('Updated table data after applying both filters:', this.filteredTableData);
  }


  /**
   * Toggle handler for the Type Filter select dropdown.
   * Re-applies all filters when the select option changes.
   */
  toggleTypeFilter(): void {
    this.applyFilters();
  }

  /**
   * Parse a date string to a year number.
   * Supports full dates and years.
   */


  parseDate(date: string): { year: number | null; month: number | null; day: number | null } {
    if (!date) return { year: null, month: null, day: null };

    const fullDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/; // Matches YYYY-MM-DD
    const yearMonthMatch = /^(\d{4})-(\d{2})$/;         // Matches YYYY-MM
    const yearMatch = /^(\d{4})$/;                      // Matches YYYY

    let match;
    if ((match = date.match(fullDateMatch))) {
      return {
        year: parseInt(match[1], 10),
        month: parseInt(match[2], 10),
        day: parseInt(match[3], 10),
      };
    } else if ((match = date.match(yearMonthMatch))) {
      return {
        year: parseInt(match[1], 10),
        month: parseInt(match[2], 10),
        day: null, // Day is missing
      };
    } else if ((match = date.match(yearMatch))) {
      return {
        year: parseInt(match[1], 10),
        month: null, // Month is missing
        day: null, // Day is missing
      };
    }

    // Invalid format
    return { year: null, month: null, day: null };
  }




  /**
   * Determine if the licensee's signed and expiration dates fall within the specified range.
   */
  isWithinDateRange(signedDate: string, expirationDate: string): boolean {
    const start = this.parseDate(this.startDate); // Parse start date
    const end = this.parseDate(this.endDate); // Parse end date
    const signed = this.parseDate(signedDate); // Parse signed date
    const expiration = this.parseDate(expirationDate); // Parse expiration date

    // If signed or expiration dates are invalid, exclude the record
    if (!signed.year && !expiration.year) return false;

    const isDateWithinRange = (
      date: { year: number | null; month: number | null; day: number | null },
      rangeStart: { year: number | null; month: number | null; day: number | null } | null,
      rangeEnd: { year: number | null; month: number | null; day: number | null } | null
    ): boolean => {
      if (!date.year) return false;

      // Compare years
      if (rangeStart?.year && date.year < rangeStart.year) return false;
      if (rangeEnd?.year && date.year > rangeEnd.year) return false;

      // Compare months if applicable
      if (
        rangeStart?.year === date.year &&
        rangeStart.month &&
        date.month &&
        date.month < rangeStart.month
      ) {
        return false;
      }
      if (
        rangeEnd?.year === date.year &&
        rangeEnd.month &&
        date.month &&
        date.month > rangeEnd.month
      ) {
        return false;
      }

      // Compare days if applicable
      if (
        rangeStart?.year === date.year &&
        rangeStart.month === date.month &&
        rangeStart.day &&
        date.day &&
        date.day < rangeStart.day
      ) {
        return false;
      }
      if (
        rangeEnd?.year === date.year &&
        rangeEnd.month === date.month &&
        rangeEnd.day &&
        date.day &&
        date.day > rangeEnd.day
      ) {
        return false;
      }

      return true;
    };

    switch (this.dateFilterType) {
      case 'exactDate':
        return (
          isDateWithinRange(signed, start, start) || isDateWithinRange(expiration, end, end)
        );

      case 'fullPeriod':
        return (
          isDateWithinRange(signed, start, end) || isDateWithinRange(expiration, start, end)
        );

      case 'startDateInside':
        return isDateWithinRange(signed, start, end);

      case 'endDateInside':
        return isDateWithinRange(expiration, start, end);

      case 'anyDateInside':
        return (
          isDateWithinRange(signed, start, end) || isDateWithinRange(expiration, start, end)
        );

      default:
        return false;
    }
  }



  /**
   * Apply date filter to the filtered table data.
   * Updates cell colors based on whether the licensee meets the date criteria.
   */
  applyDateFilter(): void {
    if (!this.startDate && !this.endDate) {
      // No date filter applied
      return;
    }

    this.filteredTableData = this.filteredTableData.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (cell === 'green') {
          const licensor = this.licensors[rowIndex];
          const licensee = this.filteredLicensees[colIndex];

          const isValid =
            this.checkDateInData(this.fetchedData, licensor, licensee) ||
            this.checkDateInData(this.paymentsData, licensor, licensee) ||
            this.checkDateInData(this.multiplePayments, licensor, licensee) ||
            this.checkDateInData(this.multipleLicenses, licensor, licensee);

          return isValid ? 'green' : 'white';
        }
        return cell;
      })
    );

    console.log('Table data after applying date filter:', this.filteredTableData);
  }

  /**
   * Check if any data entry for the given licensor and licensee meets the date criteria.
   */
  checkDateInData(data: any[], licensor: string, licensee: string): boolean {
    return data.some(
      (item) =>
        item.licensor === licensor &&
        this.normalizeName(item.licensee) === licensee &&
        this.isWithinDateRange(item.signed_date, item.expiration_date)
    );
  }

  /**
   * Sort licensees alphabetically based on their original names.
   */
  sortLicenseesAlphabetically(): void {
    this.filteredLicensees.sort((a, b) =>
      this.normalizedToOriginalLicenseeMap.get(a)!.localeCompare(
        this.normalizedToOriginalLicenseeMap.get(b)!,
        undefined,
        { sensitivity: 'base' }
      )
    );

    // Realign columns in the table data to match the new order of licensees
    this.filteredTableData = this.filteredTableData.map((row) => {
      return this.filteredLicensees.map((licensee) => {
        const licenseeIndex = this.allLicensees.indexOf(licensee);
        return row[licenseeIndex];  // Align columns correctly
      });
    });

    console.log('Licensees sorted alphabetically.');
  }

  sortLicenseesByCount(): void {
    this.filteredLicensees.sort((a, b) => this.getLicenseeCount(b) - this.getLicenseeCount(a));

    // Realign columns in the table data to match the new order of licensees
    this.filteredTableData = this.filteredTableData.map((row) => {
      return this.filteredLicensees.map((licensee) => {
        const licenseeIndex = this.allLicensees.indexOf(licensee);
        return row[licenseeIndex];  // Align columns correctly
      });
    });

    console.log('Licensees sorted by count.');
  }


  /**
   * Get the count of 'green' cells for a specific licensee.
   */
  getLicenseeCount(licensee: string): number {
    const index = this.allLicensees.indexOf(licensee);
    return this.tableData.map((row) => row[index]).filter((color) => color === 'green').length;
  }

  /**
   * Reset all filters to their default states.
   */
  resetFilters(): void {
    this.typeFilter = 'all'; // Reset to All
    this.sortOrder = 'default'; // Reset licensees to default sorting
    this.licensorSortOrder = 'default'; // Reset licensors to default sorting
    this.dateFilterType = 'None'; // Reset date filter type to None

    this.searchTerm = '';
    this.startDate = '';
    this.endDate = '';

    // Reset filtered licensees and licensors to original state
    this.filteredLicensees = [...this.originalLicensees];
    this.licensors = [...this.originalLicensors];
    this.filteredTableData = this.originalTableData.map((row) => [...row]);

    // Remove saved state from localStorage
    localStorage.removeItem('filterState');

    console.log('Filters and sorting have been reset to defaults.');
  }



  /**
   * General sorting method based on the selected sort order.
   */
  sortLicensees(): void {
    if (this.sortOrder === 'default') {
      console.log('Default sort selected for licensees.');

      // Only reset to originalLicensees if no type filter (i.e., typeFilter === 'all')
      if (this.typeFilter === 'all') {
        this.filteredLicensees = [...this.originalLicensees];
        // Realign columns based on the original order
        this.filteredTableData = this.filteredTableData.map((row, rowIndex) => {
          return this.originalLicensees.map((licensee) => {
            const licenseeIndex = this.allLicensees.indexOf(licensee);
            return this.originalTableData[rowIndex][licenseeIndex];
          });
        });
        console.log('Licensees reset to default order.');
      } else {
        // If a type filter is applied, we just update the table data based on current filteredLicensees
        this.updateFilteredTableData();
        console.log('Licensees kept in filtered order (by type).');
      }
    } else if (this.sortOrder === 'alphabetical') {
      this.sortLicenseesAlphabetically();
    } else if (this.sortOrder === 'count') {
      this.sortLicenseesByCount();
    }

    // Ensure the table is correctly displayed
    this.updateFilteredTableData();
  }




  sortLicensors(): void {
    if (this.licensorSortOrder === 'default') {
      console.log('Default sort selected for licensors.');

      // Reset to original licensor order
      this.licensors = [...this.originalLicensors];

      // Reset rows in the table data to match the original licensor order
      this.filteredTableData = this.originalLicensors.map((licensor) => {
        const licensorIndex = this.originalLicensors.indexOf(licensor);
        return [...this.originalTableData[licensorIndex]];
      });

      console.log('Licensors reset to default order.');
      return;
    }

    if (this.licensorSortOrder === 'alphabetical') {
      this.sortLicensorsAlphabetically();
    } else if (this.licensorSortOrder === 'revenue') {
      this.sortLicensorsByRevenue();
    }

    // Ensure columns remain aligned with current licensee sorting
    this.updateFilteredTableData();  }

  private updateColumnsAfterLicensorSort(): void {
    this.filteredTableData = this.filteredTableData.map((row) => {
      return this.filteredLicensees.map((licensee) => {
        const licenseeIndex = this.allLicensees.indexOf(licensee);
        return row[licenseeIndex];  // Realign columns to current licensee order
      });
    });
  }

  sortLicensorsByRevenue(): void {
    const combinedData = this.licensors.map((licensor, index) => ({
      licensor,
      revenue: this.licensorRevenues.get(licensor) || 0,  // Use 0 if revenue is not found
      tableRow: this.filteredTableData[index]
    }));

    combinedData.sort((a, b) => b.revenue - a.revenue);

    // Update the licensor and table data order
    this.licensors = combinedData.map(item => item.licensor);
    this.filteredTableData = combinedData.map(item => item.tableRow);
  }

  sortLicensorsAlphabetically(): void {
    this.licensors.sort((a, b) => a.localeCompare(b));

    // Update filteredTableData to reflect the new licensor order
    this.filteredTableData = this.licensors.map((licensor) => {
      const originalIndex = this.originalLicensors.indexOf(licensor);
      return [...this.originalTableData[originalIndex]];
    });
  }

  /**
   * Get the description for a table cell, used for tooltips.
   */
  getCellDescription(rowIndex: number, colIndex: number): string {
    const licensor = this.licensors[rowIndex];
    const licensee = this.displayLicensees[colIndex];
    return `${licensor} - ${licensee}`;
  }

  /**
   * Handle cell clicks.
   * Navigate to different routes based on cell color and store relevant information in localStorage.
   */
  cellClick(rowIndex: number, colIndex: number): void {
    const licenseeNameNormalized = this.filteredLicensees[colIndex];
    const licenseeName = this.normalizedToOriginalLicenseeMap.get(licenseeNameNormalized) || licenseeNameNormalized;
    const licensorName = this.licensors[rowIndex];
    const dynamicTitle = `${licenseeName}-${licensorName}`;
    const licenseeIndex = this.allLicensees.indexOf(licenseeNameNormalized);
    const cellColor = this.tableData[rowIndex][licenseeIndex];

    localStorage.setItem('currentDynamicTitle', dynamicTitle);
    localStorage.setItem('licensorName', licensorName);
    localStorage.setItem('licenseeName', licenseeName);

    // Save current filter state
    const filterState = {
      searchTerm: this.searchTerm,
      startDate: this.startDate,
      endDate: this.endDate,
      dateFilterType: this.dateFilterType,
      typeFilter: this.typeFilter,
      sortOrder: this.sortOrder,
      filteredLicensees: this.filteredLicensees,
    };
    localStorage.setItem('filterState', JSON.stringify(filterState));

    this.cellSelectionService.addUnselectedCell({ row: rowIndex, col: colIndex });

    if (cellColor === 'green') {
      this.router.navigate(['/license']);
    } else {
      this.router.navigate(['/payment']);
    }

    const unselectedCells = this.cellSelectionService.getUnselectedCells();
    localStorage.removeItem('unselectedCell');
    localStorage.setItem('unselectedCells', JSON.stringify(unselectedCells));
  }


  /**
   * Search Input Handler.
   * Triggers filter application when the Enter key is pressed.
   */
  onSearchInput(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.applyFilters();
    }
  }

  /**
   * Handle sort order changes.
   * Updates the sort order and applies the corresponding sort.
   */
  onSortOrderChange(event: any): void {
    this.sortOrder = event.target.value;
    this.sortLicensees();
  }

  /**
   * Handle date filter type changes.
   */
  onDateFilterTypeChange(event: any): void {
    this.dateFilterType = event.target.value;
  }

  /**
   * Getter to display original licensee names.
   * Maps normalized names back to their original form.
   */
  get displayLicensees(): string[] {
    return this.filteredLicensees.map(
      (normalized) => this.normalizedToOriginalLicenseeMap.get(normalized) || normalized
    );
  }

  showPopup(licensor: string): void {
    this.isPopupVisible = true;
    this.selectedLicensor = licensor; // Set the selected licensor
  }

  // Hide popup
  hidePopup(): void {
    this.isPopupVisible = false;
    this.selectedLicensor = null;
  }


  // Navigate to the timeline page for the selected licensor
  navigateToLicensorPage(): void {
    if (this.selectedLicensor) {
      this.router.navigate(['/timeline-overview', this.selectedLicensor]);
      this.hidePopup();
    }
  }


  private fetchedLicensorsAndData(licenseData: any[], annualRevenues: any[]): void {
    // Extract licensors and initialize the table
    this.licensors = [...new Set(licenseData.map((item) => item.licensor))].filter((licensor) => licensor !== null);
    this.tableData = Array(this.licensors.length).fill(null).map(() => Array(this.allLicensees.length).fill('white'));

    // Map revenues to licensors
    annualRevenues.forEach((revenue) => {
      this.licensorRevenues.set(revenue.licensor, revenue.total_revenue);
    });

    console.log('Licensors:', this.licensors);
    console.log('Licensor Revenues:', this.licensorRevenues);
  }


  isSalesPopupVisible = false; // Tracks visibility of the sales popup
  salesList: any[] = []; // Declare the salesList property




  applyFilters(): void {
    // Step 1: Apply the type filter first
    this.filterByType();

    // Step 2: Apply the search filter
    this.filterBySearch();

    // Step 3: Update filteredTableData based on the current filteredLicensees and licensors
    this.filteredTableData = this.licensors.map((licensor) => {
      return this.filteredLicensees.map((licensee) => {
        const licensorIndex = this.originalLicensors.indexOf(licensor);
        const licenseeIndex = this.originalLicensees.indexOf(licensee);
        return licensorIndex !== -1 && licenseeIndex !== -1
          ? this.originalTableData[licensorIndex][licenseeIndex]
          : 'white';
      });
    });

    // Step 4: Sort the licensees
    this.sortLicensees();

    // **NEW STEP**: Re-apply the date filter after sorting
    this.applyDateFilter();

    console.log('Updated table after applying filters, sorting, and date filter:', this.filteredTableData);
  }


  showPopupForLicensee(licensee: string): void {
    this.selectedLicensee = licensee;
    this.isSalesPopupVisible = true;
    this.loadSalesData();
  }

  hideSalesPopup(): void {
    this.isSalesPopupVisible = false;
    this.salesList = [];  // Clear previous sales data when hiding popup
  }

  loadSalesData(): void {
    this.salesService.getSalesForLicensee(this.selectedLicensee).subscribe(
      (data) => {
        this.salesList = data;
        console.log('Loaded sales data for licensee:', this.salesList);
        this.plotSalesData();  // Call the plotting function
      },
      (error) => {
        console.error('Error loading sales data:', error);
      }
    );
  }

  plotSalesData(): void {
    const filteredData = this.salesList.filter((item) => item.licensee === this.selectedLicensee);

    if (filteredData.length === 0) {
      console.warn('No data available for the selected licensee');
      return;
    }

    const xValues: string[] = [];
    const yValues: number[] = [];
    const customData: any[] = [];

    // Populate arrays for Plotly
    filteredData.forEach((item) => {
      xValues.push(`${item.years} Q${item.quarters}`);
      yValues.push(item.sales);
      customData.push({
        year: item.years,
        quarter: item.quarters,
        source: item.source,
      });
    });

    const trace = {
      x: xValues,
      y: yValues,
      mode: 'lines+markers',
      type: 'scatter',
      marker: { color: '#17BECF' },
      name: this.selectedLicensee,
      customdata: customData,
      hovertemplate: `
        <b>Licensee:</b> ${this.selectedLicensee}<br>
        <b>Year & Quarter:</b> %{x}<br>
        <b>Sales:</b> %{y}<br>
        <b>Source:</b> %{customdata.source}<extra></extra>
      `,
    };

    const layout = {
      title: `Sales Data for ${this.selectedLicensee}`,
      xaxis: { title: 'Year and Quarter' },
      yaxis: { title: 'Sales Amount' },
      height: 600,
      margin: { t: 40, l: 50, r: 50, b: 100 },
    };

    // Render plot inside the popup
    const plotDiv = document.getElementById('salesPlot');
    if (plotDiv) {
      Plotly.newPlot(plotDiv, [trace], layout);
    }
  }

}
