import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DictionariesClient, JdeClient, SntClient, AwpClient, InvoicesClient } from 'src/app/api/GCPClient';
import { InvoiceFacade } from '../../shared/invoice.facade';

import { NcComponent } from './nc.component';

describe('NcComponent', () => {
  let component: NcComponent;
  let fixture: ComponentFixture<NcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [NcComponent],
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
    fixture = TestBed.createComponent(NcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
