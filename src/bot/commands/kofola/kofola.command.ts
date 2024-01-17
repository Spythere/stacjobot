import { Command, Handler } from '@discord-nestjs/core';
import { CommandInteraction, GuildMemberRoleManager, InteractionReplyOptions, PermissionsBitField } from 'discord.js';
import { PrismaService } from '../../../prisma/prisma.service';
import { stacjobotUsers } from '@prisma/client';
import { getEmojiByName } from '../../utils/emojiUtils';
import { isDevelopment } from '../../utils/envUtils';
import { getDiscordTimeFormat } from '../../../utils/discordTimestampUtils';
import { randomRangeInteger, randomRangeFloat } from '../../../utils/randomUtils';

const ROLE_MULTIPLIERS = {
  Wspierający: 1.4,
  Stacjosponsor: 1.4,
  'Krąg Wtajemniczenia': 1.75,
  'St. Strażnik': 1.75,
  Wtajemniczony: 1.25,
  Spythere: 1.75,
};

const RANGES = {
  MAX_TIMEOUT_HOURS: 12,
  MIN_TIMEOUT_HOURS: 9,

  AMOUNT_MAX: 5,
  AMOUNT_MIN: 1,
};

@Command({
  name: 'kofola',
  description: 'Losowanie kofoli',
})
export class KofolaCmd {
  constructor(private prisma: PrismaService) {}

  @Handler()
  async onCommand(interaction: CommandInteraction): Promise<InteractionReplyOptions> {
    const stacjobotUser = await this.prisma.stacjobotUsers.findUnique({
      where: { userId: interaction.user.id },
    });

    const kofolaEmoji = getEmojiByName('kofola2');

    if (!isDevelopment() && stacjobotUser && stacjobotUser.nextKofolaTime > new Date()) {
      const motosraczekEmoji = getEmojiByName(stacjobotUser.kofolaMotoracek);
      const tenseSmashEmoji = getEmojiByName('tenseSmash');

      return {
        content: `Twój ${motosraczekEmoji} z kofolą przyjedzie ${getDiscordTimeFormat(
          stacjobotUser.nextKofolaTime.getTime(),
          'relative',
        )} ${tenseSmashEmoji} \nObecnie posiadasz: ${stacjobotUser.kofolaCount.toFixed(2)}l ${kofolaEmoji}!`,
      };
    }

    try {
      const updatedInfo = await this.updateUser(stacjobotUser, interaction);

      const notujEmoji = getEmojiByName('notujspeed');
      const motosraczekEmoji = getEmojiByName(updatedInfo.nextMotoracekName);

      const gainMessage = `Zdobyłeś **${updatedInfo.randKofolaAmount.toFixed(2)}l** ${kofolaEmoji}!`;
      const totalMessage = `(Łącznie: ${updatedInfo.upsertedUser.kofolaCount.toFixed(2)})`;

      const nextKofolaTimestamp = getDiscordTimeFormat(updatedInfo.upsertedUser.nextKofolaTime.getTime(), 'relative');
      const nextKofolaMessage = `*Następna dostawa*: ${motosraczekEmoji} ${nextKofolaTimestamp}`;

      const topListPlace = await this.fetchTopUserPlace(interaction);

      const topPlaceMessage =
        topListPlace != -1
          ? `\n${notujEmoji} Obecnie jesteś na **${topListPlace}. miejscu** top listy zebranych kofoli! ${notujEmoji}`
          : ``;

      // message.react(kofolaEmoji);

      return {
        content: `${gainMessage} ${totalMessage}\n${nextKofolaMessage}${topPlaceMessage}`,
      };
    } catch (error) {
      console.log(error);

      return {
        content: 'Ups! Coś poszło nie tak podczas przetwarzania komendy!',
        ephemeral: true,
      };
    }
  }

  private async updateUser(stacjobotUser: stacjobotUsers, interaction: CommandInteraction) {
    const randTimeout = randomRangeInteger(RANGES.MAX_TIMEOUT_HOURS, RANGES.MIN_TIMEOUT_HOURS);
    const nextTime = new Date(new Date().getTime() + randTimeout * 60 * 60 * 1000);

    const randKofolaAmount =
      randomRangeFloat(RANGES.AMOUNT_MAX, RANGES.AMOUNT_MIN, 2) * this.getMaxMultiplier(interaction) * 1.2;

    const nextMotoracekName = `motosraczek${randomRangeInteger(5, 1)}`;
    const userName = interaction.user.globalName ?? interaction.user.displayName ?? interaction.user.username ?? '';
    const streakValue = this.getStreakValue(stacjobotUser);

    const upsertedUser = await this.prisma.stacjobotUsers.upsert({
      where: {
        userId: interaction.user.id,
      },

      create: {
        userId: interaction.user.id,
        nextKofolaTime: nextTime,
        kofolaCount: randKofolaAmount,
        kofolaMotoracek: nextMotoracekName,
        userName,
      },

      update: {
        kofolaCount: {
          increment: randKofolaAmount,
        },
        nextKofolaTime: nextTime,
        kofolaMotoracek: nextMotoracekName,
        kofolaStreak: streakValue,
        userName,
      },
    });

    return {
      upsertedUser,
      randKofolaAmount,
      nextMotoracekName,
    };
  }

  private async fetchTopUserPlace(interaction: CommandInteraction) {
    const topList: { position: number }[] = await this.prisma.$queryRaw`SELECT * FROM (
        SELECT CAST(row_number() over(ORDER BY "kofolaCount" desc) AS INT) position, "kofolaCount", "userId" FROM "stacjobotUsers") t WHERE "userId"=${interaction.user.id} AND position <= 15`;

    return topList.length == 1 ? topList[0].position : -1;
  }

  private getMaxMultiplier(interaction: CommandInteraction) {
    if (interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator)) return ROLE_MULTIPLIERS['Spythere'];

    const multipliedRoles = (interaction.member.roles as GuildMemberRoleManager).cache.filter((role) =>
      Object.keys(ROLE_MULTIPLIERS).includes(role.name),
    );

    return Math.max(1, ...multipliedRoles.map((role) => ROLE_MULTIPLIERS[role.name]));
  }

  private getStreakValue(stacjobotUser: stacjobotUsers) {
    if (!stacjobotUser || !stacjobotUser.nextKofolaTime) return 1;

    const maxStreakDate = stacjobotUser.nextKofolaTime;
    maxStreakDate.setHours(maxStreakDate.getHours() + 12);

    return new Date() <= maxStreakDate ? ++stacjobotUser.kofolaStreak : 1;
  }
}
