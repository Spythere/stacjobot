import {
  APIEmbedField,
  AllowedMentionsTypes,
  Colors,
  EmbedBuilder,
  Message,
} from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { customEmojiIds } from '../constants/customEmojiIds';

export async function getKofolaTopList(
  prisma: PrismaService,
  message: Message,
) {
  const topKofolaCount = await prisma.stacjobotUsers.groupBy({
    where: {
      kofolaCount: {
        gt: 0,
      },
    },

    by: ['kofolaCount', 'userId'],
    orderBy: {
      kofolaCount: 'desc',
    },
    take: 10,
  });

  const topList: string[] = await topKofolaCount.reduce(
    async (acc, top, i) => {
      const discordUser = await message.client.users.fetch(top.userId);
      //${discordUser?.username || 'Nieznany użytkownik :('}
      (await acc).push(
        `**${i + 1}.**\t<@${top.userId}> - ${top.kofolaCount}x ${
          customEmojiIds.kofola
        }`,
      );
      return acc;
    },
    Promise.resolve([] as string[]),
  );

  message.channel.send({
    content: `# TOP LISTA ZEBRANYCH ${customEmojiIds.kofola}\n${topList.join(
      '\n',
    )}`,
    allowedMentions: {
      parse: [],
    },
  });

  //   message.channel.send({
  //     body: 'siema',
  //     allowedMentions: {},
  //   });
}
