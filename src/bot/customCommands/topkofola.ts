import { Message } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { getEmojiByName } from '../constants/customEmojiIds';

export async function fetchTopUsers(prisma: PrismaService) {
  const fetchedData = await prisma.stacjobotUsers.groupBy({
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

  return fetchedData;
}

export async function getKofolaTopList(
  prisma: PrismaService,
  message: Message,
) {
  const topKofolaCount = await fetchTopUsers(prisma);
  const kofolaEmoji = getEmojiByName(message, 'kofola2');

  const topList: string[] = topKofolaCount.reduce((acc, top, i) => {
    acc.push(`${i + 1}. <@${top.userId}> - ${top.kofolaCount}l ${kofolaEmoji}`);
    return acc;
  }, [] as string[]);

  message.channel.send({
    content: `# TOP LISTA ZEBRANYCH ${kofolaEmoji}\n${topList.join('\n')}`,
    allowedMentions: {
      parse: [],
    },
  });
}
