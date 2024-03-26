// spider-chart-result.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { DataSharingService } from '../data-sharing-service.service';
import { TableDataService } from '../table-data-service.service';

@Component({
  selector: 'app-spider-chart-result',
  templateUrl: './spider-chart-result.component.html',
  styleUrls: ['./spider-chart-result.component.css'],
})
export class SpiderChartResultComponent implements OnInit {
  @Input() selectedCells: { rowName: string; colName: string }[] = [];

  constructor(private dataSharingService: DataSharingService,private tableDataService: TableDataService) {}

  ngOnInit(): void {
    // Retrieve selected cell data from the data service
    this.dataSharingService.getSelectedCellsData().subscribe((data) => {
      this.selectedCells = data;
      console.log('SelectedCells updated:', data); // Add this line for debugging
    });
  }
  tableData: string[][] = this.tableDataService.getTableData();
  cellColors: { row: number; col: number; color: string }[] = this.tableDataService.getCellColors();

  removeSelectedCell(index: number): void {
    // Remove the selected cell at the given index
    if (index >= 0 && index < this.selectedCells.length) {
      this.selectedCells.splice(index, 1);

      // Update the selected cells data in the service
      this.dataSharingService.setSelectedCellsData(this.selectedCells);
    }
  }
}
