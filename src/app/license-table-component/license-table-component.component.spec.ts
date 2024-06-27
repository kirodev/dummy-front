import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseTableComponent } from './license-table-component.component';

describe('LicenseTableComponentComponent', () => {
  let component: LicenseTableComponent;
  let fixture: ComponentFixture<LicenseTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LicenseTableComponent]
    });
    fixture = TestBed.createComponent(LicenseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
