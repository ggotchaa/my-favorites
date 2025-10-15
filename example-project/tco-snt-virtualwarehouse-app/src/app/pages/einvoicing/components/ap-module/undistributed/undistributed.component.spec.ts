import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DictionariesClient, JdeClient, SntClient, AwpClient, InvoicesClient } from 'src/app/api/GCPClient';
import { InvoiceFacade } from '../../shared/invoice.facade';

import { UndistributedComponent } from './undistributed.component';

describe('UndistributedComponent', () => {
  let component: UndistributedComponent;
  let fixture: ComponentFixture<UndistributedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [UndistributedComponent],
    imports: [MatSnackBarModule],
    providers: [
        InvoiceFacade, DictionariesClient, JdeClient, SntClient,
        AwpClient, InvoicesClient,
        provideHttpClient(withInterceptorsFromDi())
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UndistributedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
