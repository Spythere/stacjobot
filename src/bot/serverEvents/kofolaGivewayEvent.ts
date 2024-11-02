import { InjectDiscordClient } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { stacjobotUsers } from '.prisma/client';
import { Client, Collection, GuildMember, WebhookClient } from 'discord.js';
import { randomRangeFloat, randomRangeInteger } from '../../utils/randomUtils';
import { getEmojiByName } from '../utils/emojiUtils';
import { PrismaService } from '../../prisma/prisma.service';
import { Winner } from './types';
import { pl } from 'date-fns/locale';
import { format } from 'date-fns';
import { Cron } from '@nestjs/schedule';

const givewaySetup = {
  maxAmount: 5,
  minAmount: 1,
  drawMaxCount: 6,
  drawMinCount: 5,
};

@Injectable()
export class KofolaGivewayEvent {
  private webhookClient: WebhookClient;

  private readonly logger = new Logger('Event: KofolaGiveway');

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.webhookClient = new WebhookClient({
      url: config.get<string>('ANNOUNCEMENT_WEBHOOK_URL')!,
    });
  }

  // 21:37 - kofola event
  @Cron('37 21 * * *', { timeZone: 'Europe/Warsaw' })
  async kofolaGivewayCron() {
    this.runGiveway();
  }

  private async runGiveway() {
    this.logger.log('Losowanie kofoli...');

    const guildMembers = await this.fetchDiscGuildMembers();
    const dbUsers = await this.fetchRandomDbUsers();
    const drawnUsers = await this.filterFetchedUsers(guildMembers, dbUsers);

    if (drawnUsers.length == 0) {
      this.webhookClient.send({
        content: 'Losowanie przerwane z powodu brakującej liczby wymaganych uczestników :(',
      });

      return;
    }

    const winners = await this.updateWinners(drawnUsers);
    this.displayWinners(guildMembers, winners);

    this.logEventData(winners);
  }

  private logEventData(winners: Winner[]) {
    const winnersLogInfo = winners.map((w) => `${w.userName} (id: ${w.userId}; notify: ${w.kofolaNotify})`);

    this.logger.log(`Wylosowani użytkownicy: ${winnersLogInfo.join(' | ')}`);
  }

  private async fetchDiscGuildMembers() {
    const dcGuild = await this.client.guilds.fetch(this.config.get<string>('BOT_GUILD_ID')!);

    return await dcGuild.members.fetch();
  }

  private async fetchRandomDbUsers(): Promise<stacjobotUsers[]> {
    // Dev environment
    if (process.env['NODE_ENV'] === 'development')
      return await this.prisma
        .$queryRaw`SELECT * FROM "stacjobotUsers" WHERE "kofolaExcluded"=False ORDER BY random() LIMIT 50;`;

    return await this.prisma
      .$queryRaw`SELECT * FROM "stacjobotUsers" WHERE "nextKofolaTime" > (current_timestamp - interval '4 days') AND "kofolaExcluded"=False ORDER BY random() LIMIT 50;`;
  }

  private async filterFetchedUsers(dcMembers: Collection<string, GuildMember>, users: stacjobotUsers[]) {
    const drawCount = randomRangeInteger(givewaySetup.drawMaxCount, givewaySetup.drawMinCount);

    const drawnUsers = users.filter((row) =>
      dcMembers.some((m) => m.id == row.userId && (m.communicationDisabledUntilTimestamp ?? 0) <= Date.now()),
    );

    return drawnUsers.slice(0, drawCount);
  }

  private async updateWinners(drawnUsers: stacjobotUsers[]): Promise<Winner[]> {
    const updatedUsers = await this.prisma.$transaction([
      ...drawnUsers.map((user) =>
        this.prisma.stacjobotUsers.update({
          where: {
            userId: user.userId,
          },
          data: {
            kofolaCount: {
              increment: randomRangeFloat(givewaySetup.maxAmount, givewaySetup.minAmount, 2),
            },
            lastLotteryWinner: new Date(),
          },
        }),
      ),
    ]);

    return updatedUsers.map((user) => ({
      userId: user.userId,
      userName: user.userName,
      amount: user.kofolaCount - drawnUsers.find((u) => u.id == user.id)!.kofolaCount,
      totalAfter: user.kofolaCount,
      kofolaNotify: user.kofolaNotify,
    }));
  }

  private async displayWinners(dcMembers: Collection<string, GuildMember>, winners: Winner[]) {
    const kofolaEmoji = getEmojiByName('kofola2');

    const winnerDisplay = winners
      .sort((w1, w2) => w2.amount - w1.amount)
      .map((w) => {
        const dcMember = dcMembers.find((m) => m.id == w.userId);

        return `> - **${w.userName || dcMember!.user.globalName}** <@${w.userId}>: + ${w.amount.toFixed(
          2,
        )}l ${kofolaEmoji} ▶▶ **${w.totalAfter.toFixed(2)}l**!`;
      });

    const todayString = format(new Date(), 'do MMMM Yo', { locale: pl });

    const contentLines = [
      `# ${kofolaEmoji} __STACJOWNIKOWA KOFOLOTERIA DNIA ${todayString.toUpperCase()}__ ${kofolaEmoji}`,
      '# Dzisiejszymi zwycięzcami są:',
      winnerDisplay.join('\n'),
      '',
      '*Chcesz otrzymywać ping przy wygranej? Wpisz </kofolanotify:1197178633656213567>*',
    ];

    this.webhookClient.send({
      content: contentLines.join('\n'),
      allowedMentions: {
        parse: [],
        users: winners.filter((w) => w.kofolaNotify).map((w) => w.userId),
      },
      flags: ['SuppressEmbeds'],
    });
  }
}
