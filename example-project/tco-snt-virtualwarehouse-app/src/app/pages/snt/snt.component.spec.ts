import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SntComponent } from './snt.component';

describe('WarehouseComponent', () => {
  let component: SntComponent;
  let fixture: ComponentFixture<SntComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SntComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SntComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
