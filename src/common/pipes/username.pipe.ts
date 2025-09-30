import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class UsernamePipe implements PipeTransform<string> {
  transform(value: string) {
    if (!value || typeof value !== 'string')
      throw new BadRequestException('username required');
    const sanitized = value.trim();
    if (!/^[a-zA-Z0-9-]{1,39}$/.test(sanitized))
      throw new BadRequestException('invalid username');
    return sanitized.toLowerCase();
  }
}
