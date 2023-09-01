import { CanActivate, ExecutionContext } from '@nestjs/common';

const accepted = ['kofola', 'dajmute', 'topkofola'];

export class CustomCommandGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const message = context.getArgByIndex(0);
    return new RegExp(`^!(${accepted.join('|')})$`, 'i').test(message.content);
  }
}
