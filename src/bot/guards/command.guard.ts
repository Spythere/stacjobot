import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Message, PermissionFlagsBits } from 'discord.js';

const acceptedPrefix = [
  'kofola',
  'dajmute',
  'topkofola',
  'test',
  'dajbana',
  'dajmatza',
];

const acceptedEmoji = [`<:kofola2:1107627668293292083>`];

export class PrefixCommandGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const message = context.getArgByIndex(0);
    if (message.author.bot) return false;

    return new RegExp(`^!(${acceptedPrefix.join('|')})$`, 'i').test(
      message.content,
    );
  }
}

export class EmojiCommandGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const message = context.getArgByIndex(0);
    if (message.author.bot) return false;

    return new RegExp(`^(${acceptedEmoji.join('|')})$`, 'i').test(
      message.content,
    );
  }
}

export class AdministratorCommandGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const message = context.getArgByIndex<Message>(0);
    if (message.author.bot) return false;

    return message.member.permissions.has(PermissionFlagsBits.Administrator);
  }
}
