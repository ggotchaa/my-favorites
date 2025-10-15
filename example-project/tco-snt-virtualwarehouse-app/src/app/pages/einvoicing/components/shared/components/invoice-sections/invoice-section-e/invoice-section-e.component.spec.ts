import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceSectionEComponent } from './invoice-section-e.component';

describe('InvoiceSectionEComponent', () => {
  let component: InvoiceSectionEComponent;
  let fixture: ComponentFixture<InvoiceSectionEComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceSectionEComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceSectionEComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
