import { Message } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { getEmojiByName } from '../utils/emojiUtils';

export async function fetchTopUsers(prisma: PrismaService, topLimit = 15) {
  const fetchedData = await prisma.stacjobotUsers.groupBy({
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
    acc.push(
      `${i + 1}. **${top.userName}** - ${top.kofolaCount.toFixed(
        2,
      )}l ${kofolaEmoji}`,
    );
    return acc;
  }, [] as string[]);

  message.channel.send({
    content: `# TOP LISTA ZEBRANYCH ${kofolaEmoji}\n${topList.join('\n')}`,
  });
}
