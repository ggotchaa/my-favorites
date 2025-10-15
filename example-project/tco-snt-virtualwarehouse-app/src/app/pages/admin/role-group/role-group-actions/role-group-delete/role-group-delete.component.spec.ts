import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RoleGroupDeleteComponent } from './role-group-delete.component';

describe('DeleteRoleGroupComponent', () => {
  let component: RoleGroupDeleteComponent;
  let fixture: ComponentFixture<RoleGroupDeleteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RoleGroupDeleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleGroupDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
