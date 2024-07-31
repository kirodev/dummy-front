import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoiComponent } from './roi.component';

describe('RoiComponent', () => {
  let component: RoiComponent;
  let fixture: ComponentFixture<RoiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RoiComponent]
    });
    fixture = TestBed.createComponent(RoiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
