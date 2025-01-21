import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportHelpComponent } from './support-help.component';

describe('SupportHelpComponent', () => {
  let component: SupportHelpComponent;
  let fixture: ComponentFixture<SupportHelpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SupportHelpComponent]
    });
    fixture = TestBed.createComponent(SupportHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
