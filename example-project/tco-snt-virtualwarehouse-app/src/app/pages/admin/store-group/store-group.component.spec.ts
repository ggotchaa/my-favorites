import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StoreGroupComponent } from './store-group.component';

describe('StoreGroupComponent', () => {
  let component: StoreGroupComponent;
  let fixture: ComponentFixture<StoreGroupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
