import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuarterlyRevenuesComponent } from './quarterly-revenues.component';

describe('QuarterlyRevenuesComponent', () => {
  let component: QuarterlyRevenuesComponent;
  let fixture: ComponentFixture<QuarterlyRevenuesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuarterlyRevenuesComponent]
    });
    fixture = TestBed.createComponent(QuarterlyRevenuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
