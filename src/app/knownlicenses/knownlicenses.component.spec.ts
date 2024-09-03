/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { KnownlicensesComponent } from './knownlicenses.component';

describe('KnownlicensesComponent', () => {
  let component: KnownlicensesComponent;
  let fixture: ComponentFixture<KnownlicensesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KnownlicensesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnownlicensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
