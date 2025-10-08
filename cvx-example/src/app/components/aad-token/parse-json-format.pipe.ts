import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'parseJsonFormat',
  standalone: true
})
export class ParseJsonFormatPipe implements PipeTransform {
  transform(value: string): string {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
}
