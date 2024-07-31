import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackPopupComponent } from './feedback-popup.component';

describe('FeedbackPopupComponent', () => {
  let component: FeedbackPopupComponent;
  let fixture: ComponentFixture<FeedbackPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FeedbackPopupComponent]
    });
    fixture = TestBed.createComponent(FeedbackPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
