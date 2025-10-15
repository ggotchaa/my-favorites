import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSelectAwpFiltersComponent } from './product-select-awp-filters.component';

describe('ProductSelectAwpFiltersComponent', () => {
  let component: ProductSelectAwpFiltersComponent;
  let fixture: ComponentFixture<ProductSelectAwpFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductSelectAwpFiltersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductSelectAwpFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
