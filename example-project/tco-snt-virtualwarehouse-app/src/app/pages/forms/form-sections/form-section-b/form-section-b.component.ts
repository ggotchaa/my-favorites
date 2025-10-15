import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
    selector: 'app-form-section-b',
    templateUrl: './form-section-b.component.html',
    styleUrls: ['./form-section-b.component.scss'],
    standalone: false
})
export class FormSectionBComponent{
  @Input() newFormCreate: UntypedFormGroup;
  @Input() isUserProfileLoading: boolean;
}
