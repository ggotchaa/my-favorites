import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'decimalFormatter',
    standalone: false
})
export class DecimalFormatterPipe implements PipeTransform {

  transform(value: any): string {
    return value?.toLocaleString();
  }

}
