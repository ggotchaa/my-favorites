import { Component, Inject } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { EInvoicingApiClient, UpdateEsfInvoiceCommand } from "src/app/api/EInvoicingApiClient";

export class EsfInvoiceEditDialogData {
    esfinvoiceId: number;
    comment: string;
}

@Component({
    selector: 'esf-invoice-edit-dialog',
    templateUrl: 'esf-invoice-edit-dialog.component.html',
    styleUrls: ['esf-invoice-edit-dialog.component.scss'],
    standalone: false
})
export class EsfInvoiceEditDialogComponent {

    constructor(
        public dialogRef: MatDialogRef<EsfInvoiceEditDialogComponent>,
        private client: EInvoicingApiClient,
        @Inject(MAT_DIALOG_DATA) public data: EsfInvoiceEditDialogData) {
        this.createForm();
        this.populateForm();
    }
    populateForm() {
        if (this.data?.comment) {
            this.form.get('comment').setValue(this.data.comment);
        }
    }

    form: UntypedFormGroup;

    cancel(): void {
        this.closeDialog();
    }

    private closeDialog() {
        this.dialogRef.close();
    }

    submit() {
        let command = new UpdateEsfInvoiceCommand();
        command.comment = this.form.value.comment;
        command.id = this.data.esfinvoiceId;

        this.client.updateEsfInvoice(command).subscribe(_x => {
            this.dialogRef.close(command);
        });
    }

    private createForm() {
        this.form = new UntypedFormGroup({
            comment: new UntypedFormControl('')
        });
    }
}