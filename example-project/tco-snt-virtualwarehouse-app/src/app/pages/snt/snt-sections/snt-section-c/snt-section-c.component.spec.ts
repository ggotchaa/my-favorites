import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SntSectionCComponent } from './snt-section-c.component';

describe('SntSectionCComponent', () => {
  let component: SntSectionCComponent;
  let fixture: ComponentFixture<SntSectionCComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SntSectionCComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SntSectionCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
