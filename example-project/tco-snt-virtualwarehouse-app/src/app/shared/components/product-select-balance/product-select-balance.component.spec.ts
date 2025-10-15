import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductSelectBalanceComponent } from './product-select-balance.component';

describe('ProductSelectBalanceComponent', () => {
  let component: ProductSelectBalanceComponent;
  let fixture: ComponentFixture<ProductSelectBalanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductSelectBalanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductSelectBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
