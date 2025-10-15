import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSelectAwpTableComponent } from './product-select-awp-table.component';

describe('ProductSelectAwpTableComponent', () => {
  let component: ProductSelectAwpTableComponent;
  let fixture: ComponentFixture<ProductSelectAwpTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductSelectAwpTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductSelectAwpTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
