import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Focallicences2Component } from './focallicences2.component';

describe('Focallicences2Component', () => {
  let component: Focallicences2Component;
  let fixture: ComponentFixture<Focallicences2Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Focallicences2Component]
    });
    fixture = TestBed.createComponent(Focallicences2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
