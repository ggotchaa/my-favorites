import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StoreGroupDeleteComponent } from './store-group-delete.component';

describe('StoreGroupDeleteComponent', () => {
  let component: StoreGroupDeleteComponent;
  let fixture: ComponentFixture<StoreGroupDeleteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreGroupDeleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreGroupDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
