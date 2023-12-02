import { Injectable, PipeTransform } from '@nestjs/common';
import { hash } from 'bcrypt';

@Injectable()
export class TransformPasswordPipe implements PipeTransform {
  async transform(value: any) {
    value.password = await hash(value.password, 12);
    return value;
  }
}
