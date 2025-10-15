import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InvoiceSectionCComponent } from './invoice-section-c.component';

describe('InvoiceSectionCComponent', () => {
  let component: InvoiceSectionCComponent;
  let fixture: ComponentFixture<InvoiceSectionCComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [InvoiceSectionCComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceSectionCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
