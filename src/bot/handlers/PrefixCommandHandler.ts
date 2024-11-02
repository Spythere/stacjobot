import { Message } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { On } from '@discord-nestjs/core';
import { PrefixCommandGuard } from '../guards/command.guard';
import { DajBanaPrefixCmd } from '../prefixCommands/dajbana';
import { DajMutePrefixCmd } from '../prefixCommands/dajmute';
import { FrozenPrefixCmd } from '../prefixCommands/frozen';
import { SponsorPrefixCmd } from '../prefixCommands/sponsor';
import { StacjownikPrefixCmd } from '../prefixCommands/stacjownik';

@Injectable()
export class PrefixCommandHandler {
  private readonly logger = new Logger('PrefixCmd');

  constructor(
    private readonly dajBana: DajBanaPrefixCmd,
    private readonly dajMute: DajMutePrefixCmd,
    private readonly frozen: FrozenPrefixCmd,
    private readonly sponsor: SponsorPrefixCmd,
    private readonly stacjownik: StacjownikPrefixCmd,
  ) {} // !commands

  @On('messageCreate')
  @UseGuards(PrefixCommandGuard)
  async onPrefixCommand(message: Message) {
    this.logCommand(message);
    this.handlePrefixCommand(message);
  }

  private logCommand(message: Message) {
    this.logger.log(`${message.author.username} (${message.author.id}): ${message.content}`);
  }

  private handlePrefixCommand(message: Message) {
    const content = message.content;

    const [command] = content.slice(1).split(' ');
    const commandLowerCase = command.toLocaleLowerCase();

    switch (commandLowerCase) {
      case 'dajmute':
        this.dajMute.runCommand(message);
        break;

      case 'dajbana':
        this.dajBana.runCommand(message);
        break;

      case 'sponsor':
        this.sponsor.handleCommand(message);
        break;

      case 'frozen':
        this.frozen.handleCommand(message);
        break;

      case 'stacjownik':
        this.stacjownik.handleCommand(message);
        break;

      default:
        break;
    }
  }
}
