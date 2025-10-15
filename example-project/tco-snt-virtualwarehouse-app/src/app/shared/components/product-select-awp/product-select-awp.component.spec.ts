import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSelectAwpComponent } from './product-select-awp.component';

describe('ProductSelectAwpComponent', () => {
  let component: ProductSelectAwpComponent;
  let fixture: ComponentFixture<ProductSelectAwpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductSelectAwpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductSelectAwpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
