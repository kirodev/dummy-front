import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpiderChartResultComponent } from './spider-chart-result.component';

describe('SpiderChartResultComponent', () => {
  let component: SpiderChartResultComponent;
  let fixture: ComponentFixture<SpiderChartResultComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpiderChartResultComponent]
    });
    fixture = TestBed.createComponent(SpiderChartResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
