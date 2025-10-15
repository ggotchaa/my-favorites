import { Component, forwardRef, Input } from '@angular/core';
import {
  ControlValueAccessor,  
  NG_VALUE_ACCESSOR,  
} from '@angular/forms';

@Component({
    selector: 'app-show-hide-password',
    templateUrl: './show-hide-password.component.html',
    styleUrls: ['./show-hide-password.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ShowHidePasswordComponent),
            multi: true,
        },
    ],
    standalone: false
})
export class ShowHidePasswordComponent implements ControlValueAccessor {
  @Input() label: string = '';
  fieldTextType: boolean;
  value: any;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInputChange(event: any): void {
    const value = event.target.value;
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
}
