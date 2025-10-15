import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[onlyDigits]',
    standalone: false
})
export class OnlyDigitsDirective {

  constructor(private el: ElementRef) { }

  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    const regex = new RegExp(`^[0-9]*$`, "g")

    if (event.key && !String(event.key).match(regex)) {
      event.preventDefault();
    }
  }
}
