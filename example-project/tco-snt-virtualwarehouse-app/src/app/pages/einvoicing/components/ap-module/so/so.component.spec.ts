import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DictionariesClient, JdeClient, SntClient, AwpClient, InvoicesClient } from 'src/app/api/GCPClient';
import { InvoiceFacade } from '../../shared/invoice.facade';

import { SoComponent } from './so.component';

describe('SoComponent', () => {
  let component: SoComponent;
  let fixture: ComponentFixture<SoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [SoComponent],
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
    fixture = TestBed.createComponent(SoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
