import { Client, Message } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { randomMuteUser } from '../prefixCommands/dajmute';
import { addKofolaToUser } from '../prefixCommands/kofola';
import { getKofolaTopList } from '../prefixCommands/topkofola';
import { Injectable, Logger } from '@nestjs/common';
import { fakeBanUser } from '../prefixCommands/dajbana';
import { SponsorPrefixCmd } from '../prefixCommands/sponsor';

@Injectable()
export class PrefixCommandHandler {
  private readonly logger = new Logger('PrefixCmd');

  private readonly sponsorCmd: SponsorPrefixCmd;

  constructor(private readonly prisma: PrismaService) {
    this.sponsorCmd = new SponsorPrefixCmd(prisma);
  } // !commands

  private logCommand(message: Message) {
    this.logger.log(
      `${message.author.username} (${message.author.id}): ${message.content}`,
    );
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

      case 'kofola':
        addKofolaToUser(this.prisma, message);
        break;

      case 'topkofola':
        getKofolaTopList(this.prisma, message);
        break;

      case 'dajbana':
        fakeBanUser(message);
        break;

      case 'sponsor':
        this.sponsorCmd.handleCommand(message);
        break;

      default:
        break;
    }
  }
}
