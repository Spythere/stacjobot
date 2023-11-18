import { stacjobotUsers } from '@prisma/client';
import { Message, PermissionsBitField } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { randomRangeFloat, randomRangeInteger } from '../../utils/randomUtils';
import { getDiscordTimeFormat } from '../../utils/discordTimestampUtils';
import { isDevelopment } from '../utils/envUtils';
import { getLitersInPolish } from '../../utils/namingUtils';
import { fetchTopUsers } from './topkofola';
import { getEmojiByName } from '../utils/emojiUtils';

const MAX_TIMEOUT_HOURS = 12,
  MIN_TIMEOUT_HOURS = 9;

const AMOUNT_MAX = 5,
  AMOUNT_MIN = 1;

const roleMultipliers = {
  Wspierający: 1.4,
  'Krąg Wtajemniczenia': 1.75,
  'St. Strażnik': 1.75,
  Wtajemniczony: 1.25,
  Spythere: 1.75,
};

function getMaxMultiplier(message: Message) {
  if (message.member.permissions.has(PermissionsBitField.Flags.Administrator))
    return roleMultipliers['Spythere'];

  const multipliedRoles = message.member.roles.cache.filter((role) =>
    Object.keys(roleMultipliers).includes(role.name),
  );

  return Math.max(
    1,
    ...multipliedRoles.map((role) => roleMultipliers[role.name]),
  );
}

function getStreakValue(prismaUser: stacjobotUsers) {
  if (!prismaUser || !prismaUser.nextKofolaTime) return 1;

  const maxStreakDate = prismaUser.nextKofolaTime;
  maxStreakDate.setHours(maxStreakDate.getHours() + 12);

  return new Date() <= maxStreakDate ? ++prismaUser.kofolaStreak : 1;
}

export async function addKofolaToUser(prisma: PrismaService, message: Message) {
  const messageAuthorId = message.author.id;

  const user = await prisma.stacjobotUsers.findUnique({
    where: { userId: messageAuthorId },
  });

  const kofolaEmoji = getEmojiByName('kofola2');

  if (!isDevelopment() && user && user.nextKofolaTime > new Date()) {
    const motosraczekEmoji = getEmojiByName(user.kofolaMotoracek);
    const tenseSmashEmoji = getEmojiByName('tenseSmash');

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

  const randTimeout = randomRangeInteger(MAX_TIMEOUT_HOURS, MIN_TIMEOUT_HOURS);
  const nextTime = new Date(
    new Date().getTime() + randTimeout * 60 * 60 * 1000,
  );

  const randKofolaAmount = Math.round(
    randomRangeFloat(AMOUNT_MAX, AMOUNT_MIN) * getMaxMultiplier(message),
  );

  const nextMotoracekName = `motosraczek${randomRangeInteger(5, 1)}`;

  const motosraczekEmoji = getEmojiByName(nextMotoracekName);
  const notujEmoji = getEmojiByName('notujspeed');

  const upsertedUser = await prisma.stacjobotUsers.upsert({
    where: {
      userId: messageAuthorId,
    },

    create: {
      userId: messageAuthorId,
      nextKofolaTime: nextTime,
      kofolaCount: randKofolaAmount,
      kofolaMotoracek: nextMotoracekName,
      userName: message.author.globalName || '',
    },

    update: {
      kofolaCount: {
        increment: randKofolaAmount,
      },
      nextKofolaTime: nextTime,
      kofolaMotoracek: nextMotoracekName,
      kofolaStreak: getStreakValue(user),
      userName: message.author.globalName || '',
    },
  });

  // if (user) {
  //   updatedUser = await prisma.stacjobotUsers.update({
  //     where: {
  //       userId: messageAuthorId,
  //     },
  //     data: {
  //       kofolaCount: {
  //         increment: randKofolaAmount,
  //       },
  //       nextKofolaTime: nextTime,
  //       kofolaMotoracek: nextMotoracekName,
  //       kofolaStreak: getStreakValue(user),
  //       userName: message.author.globalName || '',
  //     },
  //   });
  // } else
  //   updatedUser = await prisma.stacjobotUsers.create({
  //     data: {
  //       userId: messageAuthorId,
  //       nextKofolaTime: nextTime,
  //       kofolaCount: randKofolaAmount,
  //       kofolaMotoracek: nextMotoracekName,
  //       userName: message.author.globalName || '',
  //     },
  //   });

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
  const totalMessage = `(Łącznie: ${upsertedUser.kofolaCount})`;

  const nextKofolaTimestamp = getDiscordTimeFormat(
    upsertedUser.nextKofolaTime.getTime(),
    'relative',
  );

  const nextKofolaMessage = `*Następna dostawa*: ${motosraczekEmoji} ${nextKofolaTimestamp}`;

  // TODO
  // const kofolaStreakMessage =
  //   updatedUser.kofolaStreak > 0 ? `Streak: ${updatedUser.kofolaStreak}` : '';

  message.react(kofolaEmoji);
  message.reply(
    `${gainMessage} ${totalMessage}\n${nextKofolaMessage}${topPlaceMessage}`,
  );
}
