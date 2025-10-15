import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StoreGroupCreateComponent } from './store-group-create.component';

describe('StoreGroupCreateComponent', () => {
  let component: StoreGroupCreateComponent;
  let fixture: ComponentFixture<StoreGroupCreateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreGroupCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreGroupCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
