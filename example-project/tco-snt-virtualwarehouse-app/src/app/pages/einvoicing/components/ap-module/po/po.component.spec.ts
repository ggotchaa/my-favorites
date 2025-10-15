import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AwpClient, DictionariesClient, InvoicesClient, JdeClient, SntClient } from 'src/app/api/GCPClient';
import { InvoiceFacade } from '../../shared/invoice.facade';

import { PoComponent } from './po.component';

describe('PoComponent', () => {
  let component: PoComponent;
  let fixture: ComponentFixture<PoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [PoComponent],
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
    fixture = TestBed.createComponent(PoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
