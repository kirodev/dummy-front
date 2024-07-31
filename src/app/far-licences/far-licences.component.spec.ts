import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarLicencesComponent} from './far-licences.component';

describe('FarlicensesComponent', () => {
  let component: FarlicensesComponent;
  let fixture: ComponentFixture<FarlicensesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FarlicensesComponent]
    });
    fixture = TestBed.createComponent(FarlicensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
