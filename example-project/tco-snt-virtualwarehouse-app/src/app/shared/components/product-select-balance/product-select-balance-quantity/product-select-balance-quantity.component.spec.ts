import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductSelectBalanceQuantityComponent } from './product-select-balance-quantity.component';

describe('ProductSelectBalanceQuantityComponent', () => {
  let component: ProductSelectBalanceQuantityComponent;
  let fixture: ComponentFixture<ProductSelectBalanceQuantityComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductSelectBalanceQuantityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductSelectBalanceQuantityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
