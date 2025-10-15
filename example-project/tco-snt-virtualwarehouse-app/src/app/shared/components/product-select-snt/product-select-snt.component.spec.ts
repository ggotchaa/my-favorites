import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSelectSntComponent } from './product-select-snt.component';

describe('ProductSelectSntComponent', () => {
  let component: ProductSelectSntComponent;
  let fixture: ComponentFixture<ProductSelectSntComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductSelectSntComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductSelectSntComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
