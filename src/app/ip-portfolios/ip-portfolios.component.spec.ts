import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpPortfoliosComponent } from './ip-portfolios.component';

describe('IpPortfoliosComponent', () => {
  let component: IpPortfoliosComponent;
  let fixture: ComponentFixture<IpPortfoliosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IpPortfoliosComponent]
    });
    fixture = TestBed.createComponent(IpPortfoliosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
