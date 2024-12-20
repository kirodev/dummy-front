import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicensingRevenuesComponent } from './licensing-revenues.component';

describe('LicensingRevenuesComponent', () => {
  let component: LicensingRevenuesComponent;
  let fixture: ComponentFixture<LicensingRevenuesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LicensingRevenuesComponent]
    });
    fixture = TestBed.createComponent(LicensingRevenuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
