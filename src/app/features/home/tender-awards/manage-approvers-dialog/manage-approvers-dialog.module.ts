import { NgModule } from '@angular/core';

import { SharedModule } from '../../../../shared/shared.module';
import { ManageApproversDialogComponent } from './manage-approvers-dialog.component';

@NgModule({
  declarations: [ManageApproversDialogComponent],
  imports: [SharedModule],
  exports: [ManageApproversDialogComponent],
})
export class ManageApproversDialogModule {}
