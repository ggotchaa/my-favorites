import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConfirmSntComponent } from './confirm-snt.component';

describe('ConfirmSntComponent', () => {
  let component: ConfirmSntComponent;
  let fixture: ComponentFixture<ConfirmSntComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmSntComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmSntComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
