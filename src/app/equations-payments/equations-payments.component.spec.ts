import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquationsPaymentsComponent } from './equations-payments.component';

describe('EquationsPaymentsComponent', () => {
  let component: EquationsPaymentsComponent;
  let fixture: ComponentFixture<EquationsPaymentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EquationsPaymentsComponent]
    });
    fixture = TestBed.createComponent(EquationsPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
