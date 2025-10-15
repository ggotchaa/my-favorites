import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SntShowComponent } from './snt-show.component';

describe('SntShowComponent', () => {
  let component: SntShowComponent;
  let fixture: ComponentFixture<SntShowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SntShowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SntShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
