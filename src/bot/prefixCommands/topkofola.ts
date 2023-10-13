import { Message } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { getEmojiByName } from '../utils/emojiUtils';

export async function fetchTopUsers(prisma: PrismaService, topLimit = 15) {
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

  const guild = await message.client.guilds.fetch(process.env['BOT_GUILD_ID']);
  const members = await guild.members.fetch();

  const topList: string[] = topKofolaCount.reduce((acc, top, i) => {
    const displayName = members.find((m) => m.id == top.userId)?.user
      .globalName;

    acc.push(
      `${i + 1}. **${displayName}** - ${top.kofolaCount}l ${kofolaEmoji}`,
    );
    return acc;
  }, [] as string[]);

  message.channel.send({
    content: `# TOP LISTA ZEBRANYCH ${kofolaEmoji}\n${topList.join('\n')}`,
  });
}
