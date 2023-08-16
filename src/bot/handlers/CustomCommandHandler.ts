import { Client } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { randomMuteUser } from '../customCommands/dajmute';
import { addKofolaToUser } from '../customCommands/kofola';
import { getKofolaTopList } from '../customCommands/topkofola';

export class CustomCommandHandler {
  constructor(
    private readonly client: Client,
    private readonly prisma: PrismaService,
  ) {}

  public handleCommands() {
    this.client.on('messageCreate', async (message) => {
      const content = message.content;

      if (!content.startsWith('!')) return;

      const [command] = content.slice(1).split(' ');

      switch (command.toLocaleLowerCase()) {
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
