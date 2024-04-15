import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Focallicenses2Component } from './focallicences2.component';

describe('Focallicenses2Component', () => {
  let component: Focallicenses2Component;
  let fixture: ComponentFixture<Focallicenses2Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Focallicenses2Component]
    });
    fixture = TestBed.createComponent(Focallicenses2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
