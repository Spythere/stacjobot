import { stacjobotUsers } from '@prisma/client';
import { Message } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { getEmojiByName } from '../constants/customEmojiIds';
import { randomRange } from '../../utils/randomUtils';
import { getDiscordTimeFormat } from '../../utils/discordTimestampUtils';
import { isDevelopment } from '../utils/envUtils';
import { getLitersInPolish } from '../../utils/namingUtils';

const ALLOWED_CHANNELS = [process.env.KOFOLA_CHANNEL_ID];
const MAX_TIMEOUT_HOURS = 12,
  MIN_TIMEOUT_HOURS = 9;

const AMOUNT_MAX = 5,
  AMOUNT_MIN = 1;

const roleMultipliers = {
  Wspierający: 1.5,
  'Krąg Wtajemniczenia': 1.5,
  'St. Strażnik': 1.5,
  testowy: 1.5,
};

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

  if (user && user.nextKofolaTime > new Date() && !isDevelopment()) {
    const motosraczekEmoji = getEmojiByName(message, user.kofolaMotoracek);
    const tenseSmashEmoji = getEmojiByName(message, 'tenseSmash');

    message.reply(
      `Twój ${motosraczekEmoji} z kofolą przyjedzie ${getDiscordTimeFormat(
        user.nextKofolaTime.getTime(),
        'relative',
      )} ${tenseSmashEmoji} \nObecnie posiadasz: ${
        user.kofolaCount
      }l ${kofolaEmoji}!`,
    );

    return;
  }

  let updatedUser: stacjobotUsers;

  const randTimeout = randomRange(MAX_TIMEOUT_HOURS, MIN_TIMEOUT_HOURS);

  const nextTime = new Date(
    new Date().getTime() + randTimeout * 60 * 60 * 1000,
  );

  const nextMotoracekName = `motosraczek${randomRange(5, 1)}`;
  const motosraczekEmoji = getEmojiByName(message, nextMotoracekName);

  const multipliedRoles = message.member.roles.cache.filter((role) =>
    Object.keys(roleMultipliers).includes(role.name),
  );

  const maxMultiplier = Math.max(
    1,
    ...multipliedRoles.map((role) => roleMultipliers[role.name]),
  );

  const randAmount = ~~(randomRange(AMOUNT_MAX, AMOUNT_MIN) * maxMultiplier);

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
    `Zdobyłeś ${randAmount} ${getLitersInPolish(
      randAmount,
    )} ${kofolaEmoji}! (Łącznie: ${
      updatedUser.kofolaCount
    })\nNastępna dostawa: ${motosraczekEmoji} ${getDiscordTimeFormat(
      updatedUser.nextKofolaTime.getTime(),
      'relative',
    )}`,
  );
}
