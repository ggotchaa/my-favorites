import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[restrictedDecimals]',
    standalone: false
})
export class RestrictedDecimalsDirective {
  @Input() decimals: number
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
  constructor(private el: ElementRef) { }
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const regex  = new RegExp(`^\\d*\\.?\\d{0,${this.decimals}}$`, "g")
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    const current: string = this.el.nativeElement.value;
    const next: string = current.concat(event.key);
    if (next && !String(next).match(regex)) {
      event.preventDefault();

    }
  }
  escapeRegExp(text: string): string {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

}
