import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LIBComponent } from './lib.component';

describe('LIBComponent', () => {
  let component: LIBComponent;
  let fixture: ComponentFixture<LIBComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LIBComponent]
    });
    fixture = TestBed.createComponent(LIBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
