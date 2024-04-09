import { Command, Handler } from '@discord-nestjs/core';
import { CommandInteraction, GuildMemberRoleManager, InteractionReplyOptions, PermissionsBitField } from 'discord.js';
import { PrismaService } from '../../../prisma/prisma.service';
import { stacjobotUsers } from '.prisma/client';
import { getEmojiByName } from '../../utils/emojiUtils';
import { isDevelopment } from '../../utils/envUtils';
import { getDiscordTimeFormat } from '../../../utils/discordTimestampUtils';
import { randomRangeInteger, randomRangeFloat } from '../../../utils/randomUtils';

const DEFAULT = {
  multiplier: 1.1,
  maxTimeoutHours: 12,
  minTimeoutHours: 9,
  maxAmount: 6,
  minAmount: 1,
};

type RoleName = 'Wspierający' | 'Stacjosponsor' | 'Krąg Wtajemniczenia' | 'St. Strażnik' | 'Wtajemniczony' | 'Spythere';

const roleProps: Record<RoleName, { multiplier: number }> = {
  Wspierający: { multiplier: 1.4 },
  Stacjosponsor: { multiplier: 1.45 },
  'Krąg Wtajemniczenia': { multiplier: 1.45 },
  'St. Strażnik': { multiplier: 1.45 },
  Wtajemniczony: { multiplier: 1.25 },
  Spythere: { multiplier: 1.5 },
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
    const randTimeout = randomRangeInteger(DEFAULT.maxTimeoutHours, DEFAULT.minTimeoutHours);
    const nextTime = new Date(new Date().getTime() + randTimeout * 60 * 60 * 1000);

    const randKofolaAmount =
      randomRangeFloat(DEFAULT.maxAmount, DEFAULT.minAmount, 2) * this.getMaxRoleMultiplier(interaction);

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

  private getMaxRoleMultiplier(interaction: CommandInteraction) {
    if (interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator))
      return roleProps['Spythere'].multiplier;

    const memberRoles = (interaction.member.roles as GuildMemberRoleManager).cache;
    const multipliedRoles = memberRoles.filter((role) => Object.keys(roleProps).includes(role.name));

    const max = Math.max(
      DEFAULT.multiplier,
      ...multipliedRoles.map((role) => roleProps[role.name as RoleName].multiplier),
    );

    console.log('Multiplier: %d', max);

    return max;
  }

  private getStreakValue(stacjobotUser: stacjobotUsers) {
    if (!stacjobotUser || !stacjobotUser.nextKofolaTime) return 1;

    const maxStreakDate = stacjobotUser.nextKofolaTime;
    maxStreakDate.setHours(maxStreakDate.getHours() + 12);

    return new Date() <= maxStreakDate ? ++stacjobotUser.kofolaStreak : 1;
  }
}
