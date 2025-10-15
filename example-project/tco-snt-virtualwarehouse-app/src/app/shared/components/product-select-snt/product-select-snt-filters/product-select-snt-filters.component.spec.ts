import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSelectSntFiltersComponent } from './product-select-snt-filters.component';

describe('ProductSelectSntFiltersComponent', () => {
  let component: ProductSelectSntFiltersComponent;
  let fixture: ComponentFixture<ProductSelectSntFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductSelectSntFiltersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductSelectSntFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
