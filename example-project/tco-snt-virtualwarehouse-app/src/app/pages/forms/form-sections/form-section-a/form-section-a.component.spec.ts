import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormSectionAComponent } from './form-section-a.component';

describe('FormSectionAComponent', () => {
  let component: FormSectionAComponent;
  let fixture: ComponentFixture<FormSectionAComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FormSectionAComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormSectionAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
