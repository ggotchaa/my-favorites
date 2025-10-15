import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BalancesFiltersComponent } from './balances-filters.component';

describe('BalancesFiltersComponent', () => {
  let component: BalancesFiltersComponent;
  let fixture: ComponentFixture<BalancesFiltersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BalancesFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BalancesFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
