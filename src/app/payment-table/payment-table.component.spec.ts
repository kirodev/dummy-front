import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentTableComponent } from './payment-table.component';

describe('PaymentTableComponent', () => {
  let component: PaymentTableComponent;
  let fixture: ComponentFixture<PaymentTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentTableComponent]
    });
    fixture = TestBed.createComponent(PaymentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
