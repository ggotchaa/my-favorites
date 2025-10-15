import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SntSectionDComponent } from './snt-section-d.component';

describe('SntSectionDComponent', () => {
  let component: SntSectionDComponent;
  let fixture: ComponentFixture<SntSectionDComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SntSectionDComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SntSectionDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
