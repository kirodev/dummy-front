import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarLicencesComponent } from './far-licences.component';

describe('FarLicencesComponent', () => {
  let component: FarLicencesComponent;
  let fixture: ComponentFixture<FarLicencesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FarLicencesComponent]
    });
    fixture = TestBed.createComponent(FarLicencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
