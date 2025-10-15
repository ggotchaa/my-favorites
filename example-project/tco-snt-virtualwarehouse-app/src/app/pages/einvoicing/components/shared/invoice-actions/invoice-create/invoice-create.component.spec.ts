import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { InvoiceActionMode } from 'src/app/model/enums/InvoiceActionMode';
import { CommonDataService } from 'src/app/shared/services/common-data.service';
import { InvoiceActionsDependenciesBase } from '../invoice-actions-base/invoice-actions-dependencies.base';
import { InvoiceCreateComponent } from './invoice-create.component';


describe('InvoiceCreateComponent', () => {
    let component: InvoiceCreateComponent;
    let fixture: ComponentFixture<InvoiceCreateComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [InvoiceCreateComponent],
            providers: [
                InvoiceActionsDependenciesBase,
                // {
                //     provide: 'MODE',
                //     useValue: InvoiceActionMode.Add
                // }

            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InvoiceCreateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
});
