import { Message } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { getEmojiByName } from '../utils/emojiUtils';

export async function fetchTopUsers(prisma: PrismaService, topLimit = 10) {
  const fetchedData = await prisma.stacjobotUsers.groupBy({
    where: {
      kofolaCount: {
        gt: 0,
      },
    },

    by: ['kofolaCount', 'userId', 'nextKofolaTime'],
    orderBy: {
      kofolaCount: 'desc',
    },
    take: topLimit,
  });

  return fetchedData;
}

export async function getKofolaTopList(
  prisma: PrismaService,
  message: Message,
) {
  const topKofolaCount = await fetchTopUsers(prisma);
  const kofolaEmoji = getEmojiByName('kofola2');

  const topList: string[] = topKofolaCount.reduce((acc, top, i) => {
    acc.push(`${i + 1}. <@${top.userId}> - ${top.kofolaCount}l ${kofolaEmoji}`);
    return acc;
  }, [] as string[]);

  message.channel.send({
    content: `# TOP LISTA ZEBRANYCH ${kofolaEmoji}\n${topList.join('\n')}`,
    allowedMentions: {
      parse: [],
    },
    flags: ['SuppressNotifications'],
  });
}
