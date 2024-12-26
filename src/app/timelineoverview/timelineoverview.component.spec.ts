import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineoverviewComponent } from './timelineoverview.component';

describe('TimelineoverviewComponent', () => {
  let component: TimelineoverviewComponent;
  let fixture: ComponentFixture<TimelineoverviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimelineoverviewComponent]
    });
    fixture = TestBed.createComponent(TimelineoverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
