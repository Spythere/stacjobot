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

const emojiRules = [
  {
    emojiId: '<:kofola2:1107627668293292083>',
    channels: ['1141346840546115686', '1141354749619343381'],
  },
];

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
    const message = context.getArgByIndex(0) as Message;

    if (!('author' in message)) return false;
    if (message.author.bot) return false;

    return (
      emojiRules
        .find((rule) => rule.emojiId === message.content)
        ?.channels.includes(message.channelId) ?? false
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
