// mobile.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CellSelectionService } from '../cell-selection-service.service';
import { ConnectionService } from '../connection.service';
import { PaymentConnection } from '../payment-connection.service';
import { CompanyTypeService, CompanyType } from '../company-type.service';

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


  dateFilterType:
    | 'exactDate'
    | 'fullPeriod'
    | 'startDateInside'
    | 'endDateInside'
    | 'anyDateInside' = 'exactDate';

  constructor(
    private router: Router,
    private cellSelectionService: CellSelectionService,
    private connectionService: ConnectionService,
    private paymentConnection: PaymentConnection,
    private companyTypeService: CompanyTypeService // Inject CompanyTypeService
  ) {}

  ngOnInit(): void {
    // Check for saved state in localStorage
    localStorage.removeItem('filterState');

    const savedFilterState = localStorage.getItem('filterState');
    if (savedFilterState) {
      const filterState = JSON.parse(savedFilterState);
      this.searchTerm = filterState.searchTerm || '';
      this.startDate = filterState.startDate || '';
      this.endDate = filterState.endDate || '';
      this.dateFilterType = filterState.dateFilterType || 'exactDate';
      this.typeFilter = filterState.typeFilter || 'all'; // Ensure 'all' is default
      this.sortOrder = filterState.sortOrder || 'default'; // Ensure 'default' is used
    } else {
      // Set defaults explicitly
      this.typeFilter = 'all';
      this.sortOrder = 'default';
    }

    // Fetch all necessary data
    forkJoin({
      companyTypes: this.companyTypeService.getCompanyTypes(),
      licenseData: this.connectionService.getData(),
      payments: this.paymentConnection.getPayments(),
      multiplePayments: this.paymentConnection.getMultiplePayments(),
      multipleLicenses: this.connectionService.getMultipleLicenses(),
    }).subscribe({
      next: ({
        companyTypes,
        licenseData,
        payments,
        multiplePayments,
        multipleLicenses,
      }) => {
        this.companyTypes = companyTypes;
        this.mapLicenseeTypes();

        this.fetchedData = licenseData;
        this.licensors = [
          ...new Set(this.fetchedData.map((item) => item.licensor)),
        ].filter((licensor) => licensor !== null);
        this.allLicensees = [
          ...new Set(this.fetchedData.map((item) => item.licensee)),
        ].filter((licensee) => licensee !== 'Unknown' && licensee !== null);

        // Include payments data
        this.paymentsData = payments;
        const paymentLicensors = [
          ...new Set(payments.map((item) => item.licensor)),
        ].filter((licensor) => licensor !== null);
        const paymentLicensees = [
          ...new Set(payments.map((item) => item.licensee)),
        ].filter((licensee) => licensee !== 'Unknown' && licensee !== null);

        this.licensors = [
          ...new Set([...this.licensors, ...paymentLicensors]),
        ];
        this.allLicensees = [
          ...new Set([...this.allLicensees, ...paymentLicensees]),
        ];

        // Include multiple payments and licenses
        this.multiplePayments = multiplePayments;
        this.multipleLicenses = multipleLicenses;

        this.initializeTableData();

        // Apply default filters and sorting after fetching data
        this.applyFilters(); // Ensure type filter defaults to 'all'
        this.sortLicensees(); // Ensure sorting defaults to 'default'
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
    });
  }


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
    // Normalize allLicensees and populate mapping
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
      .filter(licensee => licensee !== ''); // Remove empty strings

    console.log('Normalized All Licensees:', this.allLicensees);
    console.log('Normalized to Original Licensee Map:', this.normalizedToOriginalLicenseeMap);

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
  applyFilters(): void {
    this.filterByType();
    this.filterBySearch();
    this.updateFilteredTableData();
    this.applyDateFilter(); // Ensure date filter is applied on the already filtered data
  }

  /**
   * Filter licensees based on the select dropdown state (include or exclude Type 1 & 10).
   */
  filterByType(): void {
    if (this.typeFilter === 'include') {
      // Show only licensees with Type 1 or 10, but exclude Type 0
      this.filteredLicensees = this.allLicensees.filter((licensee) => {
        const type = this.licenseeTypeMap.get(licensee);
        console.log(`Including Licensee: ${licensee}, Type: ${type}`);
        return type !== undefined && [1, 10].includes(type) && type !== 0;
      });
    } else if (this.typeFilter === 'exclude') {
      // Exclude licensees with Type 1 or 10 and also exclude Type 0
      this.filteredLicensees = this.allLicensees.filter((licensee) => {
        const type = this.licenseeTypeMap.get(licensee);
        console.log(`Excluding Licensee: ${licensee}, Type: ${type}`);
        return (type === undefined || ![1, 10].includes(type)) && type !== 0;
      });
    } else if (this.typeFilter === 'all') {
      // Show all licensees except Type 0
      this.filteredLicensees = this.allLicensees.filter((licensee) => {
        const type = this.licenseeTypeMap.get(licensee);
        return type !== 0;
      });
      console.log('Showing all licensees (OEM + Others), excluding Type 0.');
    }

    console.log('Filtered Licensees after Type Filter:', this.filteredLicensees);
  }



  filterBySearch(): void {
    const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
    if (lowerCaseSearchTerm) {
      this.filteredLicensees = this.filteredLicensees.filter((licensee) =>
        this.normalizedToOriginalLicenseeMap
          .get(licensee)!
          .toLowerCase()
          .includes(lowerCaseSearchTerm)
      );
    }
    console.log('Filtered Licensees after Search Filter:', this.filteredLicensees);
  }

  /**
   * Update table data based on filtered licensees.
   * Ensures that the table aligns with the current filtered and sorted licensees.
   */
  updateFilteredTableData(): void {
    this.filteredTableData = this.licensors.map((licensor) =>
      this.filteredLicensees.map((licensee) => {
        const licenseeIndex = this.allLicensees.indexOf(licensee);
        if (licenseeIndex === -1) return 'white'; // Default to 'white' if not found

        return this.tableData[this.licensors.indexOf(licensor)][licenseeIndex] === 'green'
          ? 'green'
          : 'white';
      })
    );
    console.log('Filtered Table Data:', this.filteredTableData);
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

    // If signed date is invalid, exclude the record
    if (!signed.year) return false;

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
    this.updateFilteredTableData();
  }

  /**
   * Sort licensees by the total number of 'green' cells (total statements).
   * Licensees with more 'green' cells appear first.
   */
  sortLicenseesByCount(): void {
    this.filteredLicensees.sort((a, b) => this.getLicenseeCount(b) - this.getLicenseeCount(a));
    this.updateFilteredTableData();
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
    this.sortOrder = 'default'; // Reset to Default

    this.searchTerm = '';
    this.startDate = '';
    this.endDate = '';
    this.dateFilterType = 'exactDate';

    this.filteredLicensees = [...this.originalLicensees];
    this.filteredTableData = this.originalTableData.map((row) => [...row]);

    // Remove saved state from localStorage
    localStorage.removeItem('filterState');

    console.log('Filters have been reset to defaults.');
  }




  /**
   * General sorting method based on the selected sort order.
   */
  sortLicensees(): void {
    if (this.sortOrder === 'default') {
      console.log('Default sort selected');

      // Reset the filtered licensees to the original order
      this.filteredLicensees = [...this.originalLicensees];

      // Reset the filtered table data to its original state
      this.filteredTableData = this.originalTableData.map((row) => [...row]);

      console.log('Filters have been reset to default.');
      return;
    }

    if (this.sortOrder === 'alphabetical') {
      this.sortLicenseesAlphabetically();
    } else if (this.sortOrder === 'count') {
      this.sortLicenseesByCount();
    }
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



}
