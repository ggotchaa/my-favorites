import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SntEditComponent } from './snt-edit.component';

describe('SntEditComponent', () => {
  let component: SntEditComponent;
  let fixture: ComponentFixture<SntEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SntEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SntEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
