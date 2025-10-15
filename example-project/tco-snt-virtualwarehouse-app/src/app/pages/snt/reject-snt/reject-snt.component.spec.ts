import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RejectSntComponent } from './reject-snt.component';

describe('RejectSntComponent', () => {
  let component: RejectSntComponent;
  let fixture: ComponentFixture<RejectSntComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RejectSntComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectSntComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
