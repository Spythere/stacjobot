import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Message, PermissionFlagsBits } from 'discord.js';

const accepted = [
  'kofola',
  'dajmute',
  'topkofola',
  'test',
  'dajbana',
  'dajmatza',
];

export class PrefixCommandGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const message = context.getArgByIndex(0);
    if (message.author.bot) return false;

    return new RegExp(`^!(${accepted.join('|')})$`, 'i').test(message.content);
  }
}

export class AdministratorCommandGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const message = context.getArgByIndex<Message>(0);
    if (message.author.bot) return false;

    return message.member.permissions.has(PermissionFlagsBits.Administrator);
  }
}
