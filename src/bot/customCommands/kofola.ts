import { stacjobotUsers } from '@prisma/client';
import { Message } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { getEmojiByName } from '../constants/customEmojiIds';
import { randomRange } from '../../utils/randomUtils';
import { getDiscordTimeFormat } from '../../utils/discordTimestampUtils';
import { isDevelopment } from '../utils/envUtils';
import { getLitersInPolish } from '../../utils/namingUtils';
import { fetchTopUsers } from './topkofola';

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

function getMaxMultiplier(message: Message) {
  const multipliedRoles = message.member.roles.cache.filter((role) =>
    Object.keys(roleMultipliers).includes(role.name),
  );

  return Math.max(
    1,
    ...multipliedRoles.map((role) => roleMultipliers[role.name]),
  );
}

export async function addKofolaToUser(prisma: PrismaService, message: Message) {
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

  const randKofolaAmount = ~~(
    randomRange(AMOUNT_MAX, AMOUNT_MIN) * getMaxMultiplier(message)
  );

  const nextMotoracekName = `motosraczek${randomRange(5, 1)}`;
  const motosraczekEmoji = getEmojiByName(message, nextMotoracekName);
  const notujEmoji = getEmojiByName(message, 'notujspeed');

  if (user) {
    updatedUser = await prisma.stacjobotUsers.update({
      where: {
        userId: messageAuthorId,
      },
      data: {
        kofolaCount: {
          increment: randKofolaAmount,
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
        kofolaCount: randKofolaAmount,
        kofolaMotoracek: nextMotoracekName,
      },
    });

  const topList = await fetchTopUsers(prisma);

  const topListPlace = topList.findIndex(
    (top) => top.userId == messageAuthorId,
  );

  const topPlaceMessage =
    topListPlace != -1
      ? `\n${notujEmoji} Obecnie jesteś na **${
          topListPlace + 1
        }. miejscu** top listy zebranych kofoli! ${notujEmoji}`
      : ``;

  const liters = getLitersInPolish(randKofolaAmount);
  const gainMessage = `Zdobyłeś **${randKofolaAmount} ${liters}** ${kofolaEmoji}!`;
  const totalMessage = `(Łącznie: ${updatedUser.kofolaCount})`;

  const nextKofolaTimestamp = getDiscordTimeFormat(
    updatedUser.nextKofolaTime.getTime(),
    'relative',
  );

  const nextKofolaMessage = `*Następna dostawa*: ${motosraczekEmoji} ${nextKofolaTimestamp}`;

  message.react(kofolaEmoji);
  message.reply(
    `${gainMessage} ${totalMessage}\n${nextKofolaMessage}${topPlaceMessage}`,
  );

  // message.reply(
  //   `Zdobyłeś **${randKofolaAmount} ${getLitersInPolish(randKofolaAmount)}** ${kofolaEmoji}! (Łącznie: ${
  //     updatedUser.kofolaCount
  //   })\n*Następna dostawa:* ${motosraczekEmoji} ${getDiscordTimeFormat(updatedUser.nextKofolaTime.getTime(), 'relative')}${topPlaceMessage}`,
  // );
}
