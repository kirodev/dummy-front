import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomUpComponent } from './bottom-up.component';

describe('BottomUpComponent', () => {
  let component: BottomUpComponent;
  let fixture: ComponentFixture<BottomUpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BottomUpComponent]
    });
    fixture = TestBed.createComponent(BottomUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
