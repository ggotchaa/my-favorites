import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSelectEgpTableComponent } from './product-select-egp-table.component';

describe('ProductSelectEgpTableComponent', () => {
  let component: ProductSelectEgpTableComponent;
  let fixture: ComponentFixture<ProductSelectEgpTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductSelectEgpTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductSelectEgpTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
