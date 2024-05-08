import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SechomeComponent } from './sechome.component';

describe('SechomeComponent', () => {
  let component: SechomeComponent;
  let fixture: ComponentFixture<SechomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SechomeComponent]
    });
    fixture = TestBed.createComponent(SechomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
