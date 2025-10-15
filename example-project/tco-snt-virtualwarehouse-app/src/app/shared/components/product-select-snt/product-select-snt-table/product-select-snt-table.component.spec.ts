import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSelectSntTableComponent } from './product-select-snt-table.component';

describe('ProductSelectSntTableComponent', () => {
  let component: ProductSelectSntTableComponent;
  let fixture: ComponentFixture<ProductSelectSntTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductSelectSntTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductSelectSntTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
