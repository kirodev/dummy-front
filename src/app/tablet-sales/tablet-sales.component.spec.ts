import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabletSalesComponent } from './tablet-sales.component';

describe('TabletSalesComponent', () => {
  let component: TabletSalesComponent;
  let fixture: ComponentFixture<TabletSalesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TabletSalesComponent]
    });
    fixture = TestBed.createComponent(TabletSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
