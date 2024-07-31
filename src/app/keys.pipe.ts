import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keys'
})
export class KeysPipe implements PipeTransform {
  transform(value: any): any[] {
    if (!value || typeof value !== 'object') {
      return [];
    }
    return Object.keys(value);
  }
}
