import { stacjobotUsers } from '@prisma/client';
import { Message } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { customEmojiIds } from '../constants/customEmojiIds';

const ALLOWED_CHANNELS = [process.env.KOFOLA_CHANNEL_ID];
const TIMEOUT_HOURS = 12;

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

  let updatedUser: stacjobotUsers;
  const nextTime = new Date(
    new Date().getTime() + TIMEOUT_HOURS * 60 * 60 * 1000,
  );

  const randAmount = ~~(
    Math.random() * (RANDOM_MAX + 1 - RANDOM_MIN) +
    RANDOM_MIN
  );

  if (user) {
    if (user.nextKofolaTime > new Date()) {
      message.reply(
        `Twój ${customEmojiIds.motosraczek} z kofolą przyjedzie <t:${~~(
          user.nextKofolaTime.getTime() / 1000
        )}:R> ${customEmojiIds.tenseSmash} \nObecnie posiadasz: ${
          user.kofolaCount
        }x ${customEmojiIds.kofola}!`,
      );

      return;
    }

    updatedUser = await prisma.stacjobotUsers.update({
      where: {
        userId: messageAuthorId,
      },
      data: {
        kofolaCount: {
          increment: randAmount,
        },
        nextKofolaTime: nextTime,
      },
    });
  } else
    updatedUser = await prisma.stacjobotUsers.create({
      data: {
        userId: messageAuthorId,
        nextKofolaTime: nextTime,
        kofolaCount: randAmount,
      },
    });

  message.react(customEmojiIds.kofola);
  message.reply(
    `Zdobyłeś ${randAmount}x ${customEmojiIds.kofola}! (Łącznie: ${updatedUser.kofolaCount})`,
  );
}
