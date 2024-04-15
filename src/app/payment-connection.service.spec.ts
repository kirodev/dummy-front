import { TestBed } from '@angular/core/testing';

import { PaymentConnectionService } from './payment-connection.service';

describe('PaymentConnectionService', () => {
  let service: PaymentConnectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentConnectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
