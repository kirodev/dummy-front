// data-sharing-service.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataSharingService {
  private selectedCellsDataSubject = new BehaviorSubject<{ rowName: string; colName: string }[]>([]);
  private selectedCellsData$ = this.selectedCellsDataSubject.asObservable();

  constructor() {}

  setSelectedCellsData(data: { rowName: string; colName: string }[]): void {
    this.selectedCellsDataSubject.next(data);
    // Store data in local storage
    localStorage.setItem('selectedCells', JSON.stringify(data));
  }

  getSelectedCellsData(): Observable<{ rowName: string; colName: string }[]> {
    // Retrieve data from local storage
    const data = localStorage.getItem('selectedCells');
    if (data) {
      return this.selectedCellsDataSubject;
    } else {
      return this.selectedCellsData$;
    }
  }
}
