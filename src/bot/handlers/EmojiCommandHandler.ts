import { Message } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { addKofolaToUser } from '../prefixCommands/kofola';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmojiCommandHandler {
  private readonly logger = new Logger('EmojiCmd');

  constructor(private readonly prisma: PrismaService) {} // !commands

  private logCommand(message: Message) {
    this.logger.log(
      `${message.author.username} (${message.author.id}): ${message.content}`,
    );
  }

  public handleCommands(message: Message) {
    const content = message.content;

    this.logCommand(message);

    switch (content) {
      case '<:kofola2:1107627668293292083>':
        addKofolaToUser(this.prisma, message);
        break;

      default:
        break;
    }
  }
}
