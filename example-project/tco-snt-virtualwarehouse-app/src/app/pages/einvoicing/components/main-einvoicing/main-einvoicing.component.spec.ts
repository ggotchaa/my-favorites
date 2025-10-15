import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MainEinvoicingComponent } from './main-einvoicing.component';

describe('MainEinvoicingComponent', () => {
  let component: MainEinvoicingComponent;
  let fixture: ComponentFixture<MainEinvoicingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MainEinvoicingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainEinvoicingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
