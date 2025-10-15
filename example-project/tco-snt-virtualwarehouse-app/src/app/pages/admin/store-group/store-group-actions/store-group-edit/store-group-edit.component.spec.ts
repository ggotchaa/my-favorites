import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StoreGroupEditComponent } from './store-group-edit.component';

describe('StoreGroupEditComponent', () => {
  let component: StoreGroupEditComponent;
  let fixture: ComponentFixture<StoreGroupEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreGroupEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreGroupEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
