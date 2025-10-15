import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AccountReportingComponent } from './account-reporting.component';

describe('RoleGroupComponent', () => {
  let component: AccountReportingComponent;
  let fixture: ComponentFixture<AccountReportingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountReportingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
