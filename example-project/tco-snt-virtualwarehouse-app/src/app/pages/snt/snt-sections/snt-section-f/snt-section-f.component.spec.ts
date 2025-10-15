import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SntSectionFComponent } from './snt-section-f.component';

describe('SntSectionFComponent', () => {
  let component: SntSectionFComponent;
  let fixture: ComponentFixture<SntSectionFComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SntSectionFComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SntSectionFComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
