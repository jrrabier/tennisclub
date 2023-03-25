import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  transform(value: string, args: any[]): string {
    const limit = args.length > 0 ? args[0] : 200;
    const trail = args.length > 1 ? args[1] : ' ...';
    return value.length > limit ? value.substring(0, limit) + trail : value;
  }

}