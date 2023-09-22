import { InjectDiscordClient } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { stacjobotUsers } from '@prisma/client';
import { Client, WebhookClient } from 'discord.js';
import { getLitersInPolish } from '../../utils/namingUtils';
import { randomRange } from '../../utils/randomUtils';
import { getEmojiByName } from '../utils/emojiUtils';
import { PrismaService } from '../../prisma/prisma.service';

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
    const guild = await this.client.guilds.fetch(
      this.config.get<string>('BOT_GUILD_ID'),
    );

    const members = await guild.members.fetch();

    let randomRows: stacjobotUsers[] = await this.prisma
      .$queryRaw`SELECT * FROM "stacjobotUsers" WHERE "nextKofolaTime" > (current_timestamp - interval '4 days') ORDER BY random() LIMIT 20;`;

    randomRows = randomRows.filter((row) =>
      members.some(
        (m) =>
          m.id == row.userId && m.communicationDisabledUntilTimestamp == null,
      ),
    );

    if (randomRows.length == 0) {
      this.webhookClient.send({
        content:
          'Losowanie przerwane z powodu brakującej liczby wymaganych uczestników :(',
      });

      return;
    }

    const kofolaEmoji = getEmojiByName('kofola2');
    const winners: { userId: string; amount: number; totalAfter: number }[] =
      [];

    const drawCount = randomRange(
      givewaySetup.drawMaxCount,
      givewaySetup.drawMinCount,
    );

    for (let i = 0; i < Math.min(drawCount, randomRows.length); i++) {
      const user = randomRows[i];

      const randAmount = randomRange(
        givewaySetup.maxAmount,
        givewaySetup.minAmount,
      );

      // if (isDevelopment()) {
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

    const winnerDisplay = winners
      .sort((w1, w2) => w2.amount - w1.amount)
      .map((w) => {
        const dcMember = members.find((m) => m.id == w.userId);

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

  // announceGiveway() {
  //   const bagietyEmoji = getEmojiByName('bagiety');
  //   givewaySetup.minAmount = randomRange(5, 1);
  //   givewaySetup.maxAmount = givewaySetup.minAmount + 2;
  //   givewaySetup.drawCount = randomRange(6, 4);
  //   this.webhookClient.send({
  //     content: `# ${bagietyEmoji} KOFOLOTERIA JUŻ ZA GODZINĘ! ${bagietyEmoji}\n## DZIŚ WYLOSUJEMY *${givewaySetup.drawCount} SZCZĘŚLIWCÓW* KTÓRZY DOSTANĄ DODATKOWY PRZYDZIAŁ KOFOLI!`,
  //   });
  // }
}
