// cell-selection-service.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CellSelectionService {
  private unselectedCellsSubject = new BehaviorSubject<{ row: number; col: number }[]>([]);

  unselectedCells$: Observable<{ row: number; col: number }[]> = this.unselectedCellsSubject.asObservable();

  constructor() {}

  setUnselectedCells(unselectedCells: { row: number; col: number }[]) {
    this.unselectedCellsSubject.next(unselectedCells);
  }

  addUnselectedCell(cell: { row: number; col: number }) {
    const currentUnselectedCells = this.unselectedCellsSubject.getValue();
    const updatedUnselectedCells = [...currentUnselectedCells, cell];
    this.unselectedCellsSubject.next(updatedUnselectedCells);
  }

  removeUnselectedCell(cell: { row: number; col: number }) {
    const currentUnselectedCells = this.unselectedCellsSubject.getValue();
    const updatedUnselectedCells = currentUnselectedCells.filter(
      (c) => c.row !== cell.row && c.col !== cell.col
    );
    this.unselectedCellsSubject.next(updatedUnselectedCells);
  }
  
  getUnselectedCells(): { row: number; col: number }[] {
    return this.unselectedCellsSubject.getValue();
  }
}
