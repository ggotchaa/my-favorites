import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SntSectionEComponent } from './snt-section-e.component';

describe('SntSectionEComponent', () => {
  let component: SntSectionEComponent;
  let fixture: ComponentFixture<SntSectionEComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SntSectionEComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SntSectionEComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
