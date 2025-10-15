import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GSVSComponent } from './gsvs.component';

describe('GSVSComponent', () => {
  let component: GSVSComponent;
  let fixture: ComponentFixture<GSVSComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GSVSComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GSVSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
