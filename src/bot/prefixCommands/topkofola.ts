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

export async function getKofolaTopList(prisma: PrismaService, message: Message) {
  // const topKofolaCount = await fetchTopUsers(prisma);
  // const kofolaEmoji = getEmojiByName('kofola2');

  // const topList: string[] = topKofolaCount.reduce((acc, top, i) => {
  //   acc.push(`${i + 1}. **${top.userName}** <@${top.userId}> - ${top.kofolaCount.toFixed(2)}l ${kofolaEmoji}`);
  //   return acc;
  // }, [] as string[]);

  // message.channel.send({
  //   content: `# TOP LISTA ZEBRANYCH ${kofolaEmoji}\n${topList.join('\n')}`,
  //   allowedMentions: {
  //     parse: [],
  //     users: [],
  //   },
  //   flags: ['SuppressEmbeds', 'SuppressNotifications'],
  // });

  message.reply({
    content: `${getEmojiByName('kofola2')} ${getEmojiByName(
      'bagiety',
    )}  **Towarzyszu! Nowe komendy kofoli z sezonowo zwiększonymi mnożnikami znajdują się tutaj: </kofola:1197178633656213569> </kofolanotify:1197178633656213567> </kofolatop:1197178633656213568> **`,
  });
}
