import { Message } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { randomMuteUser } from '../prefixCommands/dajmute';
import { Injectable, Logger } from '@nestjs/common';
import { fakeBanUser } from '../prefixCommands/dajbana';
import { SponsorPrefixCmd } from '../prefixCommands/sponsor';
import { handleFrozenCommand } from '../prefixCommands/frozen';

@Injectable()
export class PrefixCommandHandler {
  private readonly logger = new Logger('PrefixCmd');

  private readonly sponsorCmd: SponsorPrefixCmd;

  constructor(private readonly prisma: PrismaService) {
    this.sponsorCmd = new SponsorPrefixCmd(prisma);
  } // !commands

  private logCommand(message: Message) {
    this.logger.log(`${message.author.username} (${message.author.id}): ${message.content}`);
  }

  public handleCommands(message: Message) {
    const content = message.content;

    const [command] = content.slice(1).split(' ');
    const commandLowerCase = command.toLocaleLowerCase();

    this.logCommand(message);

    switch (commandLowerCase) {
      case 'dajmute':
        randomMuteUser(message);
        break;

      case 'dajmatza':
        randomMuteUser(message);
        break;

      case 'dajbana':
        fakeBanUser(message);
        break;

      case 'sponsor':
        this.sponsorCmd.handleCommand(message);
        break;

      case 'frozen':
        handleFrozenCommand(message);
        break;

      default:
        break;
    }
  }
}
