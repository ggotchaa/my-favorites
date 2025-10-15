import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SntCreateComponent } from './snt-create.component';

describe('SntCreateComponent', () => {
  let component: SntCreateComponent;
  let fixture: ComponentFixture<SntCreateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SntCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SntCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
