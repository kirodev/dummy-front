import { TestBed } from '@angular/core/testing';

import { CellSelectionServiceService } from './cell-selection-service.service';

describe('CellSelectionServiceService', () => {
  let service: CellSelectionServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CellSelectionServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
