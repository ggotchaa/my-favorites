import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductSelectGsvsComponent } from './product-select-gsvs.component';

describe('ProductSelectGsvsComponent', () => {
  let component: ProductSelectGsvsComponent;
  let fixture: ComponentFixture<ProductSelectGsvsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductSelectGsvsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductSelectGsvsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
