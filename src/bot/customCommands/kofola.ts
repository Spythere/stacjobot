import { stacjobotUsers } from '@prisma/client';
import { Message } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { getEmojiByName } from '../constants/customEmojiIds';

const ALLOWED_CHANNELS = [process.env.KOFOLA_CHANNEL_ID];
const MAX_TIMEOUT_HOURS = 12,
  MIN_TIMEOUT_HOURS = 9;

const RANDOM_MAX = 5,
  RANDOM_MIN = 1;

export async function addKofolaToUser(prisma: PrismaService, message: Message) {
  if (!ALLOWED_CHANNELS.includes(message.channelId)) {
    await message.delete();
    return;
  }

  const messageAuthorId = message.author.id;

  const user = await prisma.stacjobotUsers.findUnique({
    where: { userId: messageAuthorId },
  });

  const kofolaEmoji = getEmojiByName(message, 'kofola2');

  if (user && user.nextKofolaTime > new Date()) {
    const motosraczekEmoji = getEmojiByName(message, user.kofolaMotoracek);
    const tenseSmashEmoji = getEmojiByName(message, 'tenseSmash');

    message.reply(
      `Twój ${motosraczekEmoji} z kofolą przyjedzie <t:${~~(
        user.nextKofolaTime.getTime() / 1000
      )}:R> ${tenseSmashEmoji} \nObecnie posiadasz: ${
        user.kofolaCount
      }x ${kofolaEmoji}!`,
    );

    return;
  }

  let updatedUser: stacjobotUsers;

  const randTimeout = ~~(
    Math.random() * (MAX_TIMEOUT_HOURS + 1 - MIN_TIMEOUT_HOURS) +
    MIN_TIMEOUT_HOURS
  );

  const nextTime = new Date(
    new Date().getTime() + randTimeout * 60 * 60 * 1000,
  );

  const nextMotoracekName = `motosraczek${~~(Math.random() * (6 - 1) + 1)}`;
  const motosraczekEmoji = getEmojiByName(message, nextMotoracekName);

  const randAmount = ~~(
    Math.random() * (RANDOM_MAX + 1 - RANDOM_MIN) +
    RANDOM_MIN
  );

  if (user) {
    updatedUser = await prisma.stacjobotUsers.update({
      where: {
        userId: messageAuthorId,
      },
      data: {
        kofolaCount: {
          increment: randAmount,
        },
        nextKofolaTime: nextTime,
        kofolaMotoracek: nextMotoracekName,
      },
    });
  } else
    updatedUser = await prisma.stacjobotUsers.create({
      data: {
        userId: messageAuthorId,
        nextKofolaTime: nextTime,
        kofolaCount: randAmount,
        kofolaMotoracek: nextMotoracekName,
      },
    });

  message.react(kofolaEmoji);
  message.reply(
    `Zdobyłeś ${randAmount}x ${kofolaEmoji}! (Łącznie: ${
      updatedUser.kofolaCount
    })\nNastępna dostawa: ${motosraczekEmoji} <t:${~~(
      updatedUser.nextKofolaTime.getTime() / 1000
    )}:R> `,
  );
}
