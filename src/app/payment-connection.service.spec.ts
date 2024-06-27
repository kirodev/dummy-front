import { TestBed } from '@angular/core/testing';

import { PaymentConnection } from './payment-connection.service';

describe('PaymentConnection ', () => {
  let service: PaymentConnection;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentConnection);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
