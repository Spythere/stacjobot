import { Command, Handler } from '@discord-nestjs/core';
import { CommandInteraction, InteractionReplyOptions } from 'discord.js';
import { PrismaService } from '../../../prisma/prisma.service';
import { getEmojiByName } from '../../utils/emojiUtils';

@Command({
  name: 'kofolatop',
  description: 'Pokazuje top listę zebranej kofoli',
})
export class KofolaTopCmd {
  constructor(private prisma: PrismaService) {}

  @Handler()
  async onCommand(): Promise<InteractionReplyOptions> {
    const topKofolaCount = await this.fetchKofolaTopGroup();
    const kofolaEmoji = getEmojiByName('kofola2');

    const topList: string[] = topKofolaCount.reduce((acc, top, i) => {
      acc.push(`${i + 1}. **${top.userName}** <@${top.userId}> - ${top.kofolaCount.toFixed(2)}l ${kofolaEmoji}`);
      return acc;
    }, [] as string[]);

    return {
      content: `# TOP LISTA ZEBRANYCH ${kofolaEmoji}\n${topList.join('\n')}`,
      allowedMentions: {
        parse: [],
        users: [],
      },
      flags: ['SuppressEmbeds'],
    };
  }

  private async fetchKofolaTopGroup() {
    const fetchedData = await this.prisma.stacjobotUsers.groupBy({
      where: {
        kofolaCount: {
          gt: 0,
        },
        userName: {
          not: '',
        },
      },

      by: ['kofolaCount', 'userId', 'nextKofolaTime', 'userName'],
      orderBy: {
        kofolaCount: 'desc',
      },
      take: 15,
    });

    return fetchedData;
  }
}
