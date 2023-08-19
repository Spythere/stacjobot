import { Client } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { randomMuteUser } from '../customCommands/dajmute';
import { addKofolaToUser } from '../customCommands/kofola';
import { getKofolaTopList } from '../customCommands/topkofola';
import { Logger } from '@nestjs/common';

const customCommands = ['dajmute', 'kofola', 'topkofola'];

export class CustomCommandHandler {
  constructor(
    private readonly client: Client,
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  public handleCommands() {
    this.client.on('messageCreate', async (message) => {
      const content = message.content;

      if (!content.startsWith('!')) return;

      const [command] = content.slice(1).split(' ');
      const commandLowerCase = command.toLocaleLowerCase();

      if (!customCommands.includes(commandLowerCase)) return;

      this.logger.log(
        `${message.author.username} (${message.author.id}): !${commandLowerCase}`,
      );

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
        default:
          break;
      }
    });
  }
}
