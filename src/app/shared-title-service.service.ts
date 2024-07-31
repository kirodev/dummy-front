// shared-title.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedTitleService {
  private dynamicTitleSubject = new BehaviorSubject<string>('Initial Title');
  dynamicTitle$: Observable<string> = this.dynamicTitleSubject.asObservable();

  updateDynamicTitle(newTitle: string) {
    this.dynamicTitleSubject.next(newTitle);
  }
}
