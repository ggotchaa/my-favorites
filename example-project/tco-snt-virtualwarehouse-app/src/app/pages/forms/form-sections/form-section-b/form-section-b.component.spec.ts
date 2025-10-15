import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormSectionBComponent } from './form-section-b.component';

describe('FormSectionBComponent', () => {
  let component: FormSectionBComponent;
  let fixture: ComponentFixture<FormSectionBComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FormSectionBComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormSectionBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
