import { Message } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { getEmojiByName } from '../constants/customEmojiIds';

const ALLOWED_CHANNELS = [process.env.KOFOLA_CHANNEL_ID];

export async function getKofolaTopList(
  prisma: PrismaService,
  message: Message,
) {
  if (!ALLOWED_CHANNELS.includes(message.channelId)) {
    await message.delete();
    return;
  }

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

  const kofolaEmoji = getEmojiByName(message, 'kofola2');

  const topList: string[] = topKofolaCount.reduce((acc, top, i) => {
    acc.push(`${i + 1}. <@${top.userId}> - ${top.kofolaCount}x ${kofolaEmoji}`);
    return acc;
  }, [] as string[]);

  message.channel.send({
    content: `# TOP LISTA ZEBRANYCH ${kofolaEmoji}\n${topList.join('\n')}`,
    allowedMentions: {
      parse: [],
    },
  });
}
