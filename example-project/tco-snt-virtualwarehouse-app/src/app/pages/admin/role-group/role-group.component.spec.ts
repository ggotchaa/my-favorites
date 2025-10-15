import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RoleGroupComponent } from './role-group.component';

describe('RoleGroupComponent', () => {
  let component: RoleGroupComponent;
  let fixture: ComponentFixture<RoleGroupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RoleGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
