import { TestBed } from '@angular/core/testing';

import { EquationsPaymentsService } from './equations-payments.service';

describe('EquationsPaymentsService', () => {
  let service: EquationsPaymentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EquationsPaymentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
