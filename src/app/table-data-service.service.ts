// table-data.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TableDataService {
  private tableData: string[][] = [];
  private cellColors: { row: number; col: number; color: string }[] = [];

  getTableData(): string[][] {
    return this.tableData;
  }

  setTableData(data: string[][]): void {
    this.tableData = data;
  }

  getCellColors(): { row: number; col: number; color: string }[] {
    return this.cellColors;
  }

  setCellColors(colors: { row: number; col: number; color: string }[]): void {
    this.cellColors = colors;
  }
}
