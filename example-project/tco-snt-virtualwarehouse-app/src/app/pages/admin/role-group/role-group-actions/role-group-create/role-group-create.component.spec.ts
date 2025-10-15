import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminClient, GroupRoleClient, GroupTaxpayerStoreClient, TaxpayerStoreClient } from 'src/app/api/GCPClient';
import { NotificationService } from 'src/app/services/notification.service';
import { AdminFacade } from '../../../admin.facade';

import { RoleGroupCreateComponent } from './role-group-create.component';

describe('SelectRoleGroupComponent', () => {
  let component: RoleGroupCreateComponent;
  let fixture: ComponentFixture<RoleGroupCreateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RoleGroupCreateComponent ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        {
          provide: AdminFacade,
          useValue: {
            displayErrors: () => 'Error happened'
          },
          deps: [AdminClient, GroupRoleClient, GroupTaxpayerStoreClient, TaxpayerStoreClient, NotificationService]
        }
      ],
      
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleGroupCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
