import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSelectBalanceFiltersComponent } from './product-select-balance-filters.component';

describe('ProductSelectAwpFiltersComponent', () => {
  let component: ProductSelectBalanceFiltersComponent;
  let fixture: ComponentFixture<ProductSelectBalanceFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductSelectBalanceFiltersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductSelectBalanceFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
