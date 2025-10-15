import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SntCorrectionComponent } from './snt-correction.component';

describe('SntCorrectionComponent', () => {
  let component: SntCorrectionComponent;
  let fixture: ComponentFixture<SntCorrectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SntCorrectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SntCorrectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
