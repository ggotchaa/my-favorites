import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SntSectionCurrencyComponent } from './snt-section-currency.component';

describe('SntSectionCurrencyComponent', () => {
  let component: SntSectionCurrencyComponent;
  let fixture: ComponentFixture<SntSectionCurrencyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SntSectionCurrencyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SntSectionCurrencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
