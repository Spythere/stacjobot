import { InjectDiscordClient } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { stacjobotUsers } from '@prisma/client';
import { Client, Collection, GuildMember, WebhookClient } from 'discord.js';
import { getLitersInPolish } from '../../utils/namingUtils';
import { randomRange } from '../../utils/randomUtils';
import { getEmojiByName } from '../utils/emojiUtils';
import { PrismaService } from '../../prisma/prisma.service';
import { Winner } from './se.types';

const givewaySetup = {
  maxAmount: 3,
  minAmount: 1,
  drawMaxCount: 5,
  drawMinCount: 3,
};

@Injectable()
export class KofolaGiveway {
  private webhookClient: WebhookClient;

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.webhookClient = new WebhookClient({
      url: config.get<string>('ANNOUNCEMENT_WEBHOOK_URL'),
    });
  }

  async runGiveway() {
    const dcGuild = await this.client.guilds.fetch(
      this.config.get<string>('BOT_GUILD_ID'),
    );

    const dcMembers = await dcGuild.members.fetch();

    const users = await this.fetchRandomizedUsers();
    const drawnUsers = await this.drawUsers(dcMembers, users);

    if (drawnUsers.length == 0) {
      this.webhookClient.send({
        content:
          'Losowanie przerwane z powodu brakującej liczby wymaganych uczestników :(',
      });

      return;
    }

    const winners = await this.processWinners(drawnUsers);

    this.displayWinners(dcMembers, winners);
  }

  private async fetchRandomizedUsers(): Promise<stacjobotUsers[]> {
    // Dev environment
    if (process.env['NODE_ENV'] === 'development')
      return await this.prisma
        .$queryRaw`SELECT * FROM "stacjobotUsers" ORDER BY random() LIMIT 50;`;

    return await this.prisma
      .$queryRaw`SELECT * FROM "stacjobotUsers" WHERE "nextKofolaTime" > (current_timestamp - interval '4 days') ORDER BY random() LIMIT 50;`;
  }

  private async drawUsers(
    dcMembers: Collection<string, GuildMember>,
    users: stacjobotUsers[],
  ) {
    const drawCount = randomRange(
      givewaySetup.drawMaxCount,
      givewaySetup.drawMinCount,
    );

    const drawnUsers = users.filter((row) =>
      dcMembers.some(
        (m) =>
          m.id == row.userId &&
          m.communicationDisabledUntilTimestamp <= Date.now(),
      ),
    );

    return drawnUsers.slice(0, drawCount);
  }

  private async processWinners(drawnUsers: stacjobotUsers[]) {
    const winners: Winner[] = [];

    for (let i = 0; i < drawnUsers.length; i++) {
      const user = drawnUsers[i];

      const randAmount = randomRange(
        givewaySetup.maxAmount,
        givewaySetup.minAmount,
      );

      const updatedWinner = await this.prisma.stacjobotUsers.update({
        where: {
          userId: user.userId,
        },
        data: {
          kofolaCount: {
            increment: randAmount,
          },
        },
      });

      winners.push({
        userId: user.userId,
        amount: randAmount,
        totalAfter: updatedWinner.kofolaCount,
      });
    }

    return winners.sort((w1, w2) => w2.amount - w1.amount);
  }

  private async displayWinners(
    dcMembers: Collection<string, GuildMember>,
    winners: Winner[],
  ) {
    const kofolaEmoji = getEmojiByName('kofola2');

    const winnerDisplay = winners.map((w) => {
      const dcMember = dcMembers.find((m) => m.id == w.userId);

      return `> - **${dcMember.displayName || dcMember.nickname}**: + ${
        w.amount
      }l ${kofolaEmoji} ▶▶ ${w.totalAfter} ${getLitersInPolish(
        w.totalAfter,
      )}!`;
    });

    const timestamp = ~~(Date.now() / 1000);

    const contentLines = [
      `# ${kofolaEmoji} __STACJOWNIKOWA KOFOLOTERIA DNIA__ <t:${timestamp}:D> ${kofolaEmoji}`,
      '# Dzisiejszymi zwycięzcami są:',
      winnerDisplay.join('\n'),
      '',
      '*Wszelkie zażalenia dotyczące przebiegu losowania można zgłaszać [tutaj](https://www.youtube.com/watch?v=avCWDDox1nE)*',
    ];

    this.webhookClient.send({
      content: contentLines.join('\n'),
      allowedMentions: {
        parse: [],
      },
      flags: ['SuppressEmbeds', 'SuppressNotifications'],
    });
  }
}
