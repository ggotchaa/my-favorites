import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RoleGroupEditComponent } from './role-group-edit.component';

describe('EditRoleGroupComponent', () => {
  let component: RoleGroupEditComponent;
  let fixture: ComponentFixture<RoleGroupEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RoleGroupEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleGroupEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
