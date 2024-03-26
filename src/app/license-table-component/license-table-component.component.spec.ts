import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseTableComponentComponent } from './license-table-component.component';

describe('LicenseTableComponentComponent', () => {
  let component: LicenseTableComponentComponent;
  let fixture: ComponentFixture<LicenseTableComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LicenseTableComponentComponent]
    });
    fixture = TestBed.createComponent(LicenseTableComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
