import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { InjectDiscordClient, On, Once } from '@discord-nestjs/core';
import {
  ActivityType,
  ChatInputCommandInteraction,
  Client,
  Interaction,
  InteractionType,
  Message,
  PermissionFlagsBits,
  WebhookClient,
} from 'discord.js';
import { CustomCommandHandler } from './handlers/CustomCommandHandler';
import { PrismaService } from '../prisma/prisma.service';
import { CustomCommandGuard } from './guards/command.guard';
import { ConfigService } from '@nestjs/config';
import { randomRange } from '../utils/randomUtils';
import { collectEmojis, getEmojiByName } from './utils/emojiUtils';
import { stacjobotUsers } from '@prisma/client';
import { isDevelopment } from './utils/envUtils';
import { Cron } from '@nestjs/schedule';

const givewaySetup = { minAmount: 3, maxAmount: 5, drawCount: 5 };

@Injectable()
export class BotGateway {
  private readonly logger = new Logger('DiscordBot');
  private readonly customCmdHandler: CustomCommandHandler;
  private webhookClient: WebhookClient;

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.customCmdHandler = new CustomCommandHandler(prisma, this.logger);
    this.webhookClient = new WebhookClient({
      url: config.get<string>('ANNOUNCEMENT_WEBHOOK_URL'),
    });
  }

  private logSlashCommand(i: ChatInputCommandInteraction) {
    this.logger.log(
      `${i.user.username} (${i.user.id}): /${i.commandName} ${i.options.data
        .map((param) => `${param.name}: ${param.value}`)
        .join(' ')}`,
    );
  }

  @Once('ready')
  onReady() {
    this.logger.log('Bot was started!');

    this.client.user.setActivity({
      name: 'Train Driver 2',
      type: ActivityType.Playing,
      url: 'https://stacjownik-td2.web.app',
    });

    collectEmojis(this.client);
    // if (isDevelopment()) this.announceGiveway();
  }

  @On('interactionCreate')
  async onInteraction(i: Interaction) {
    if (i.type == InteractionType.ApplicationCommand)
      this.logSlashCommand(i as ChatInputCommandInteraction);
  }

  @On('messageCreate')
  @UseGuards(CustomCommandGuard)
  async onMessage(message: Message) {
    this.customCmdHandler.handleCommands(message);

    if (
      message.content == '!test' &&
      message.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      // this.announceGiveway();
      this.scheduleGiveway();
    }
  }

  @Cron('21 20 * * *', { timeZone: 'Europe/Warsaw' })
  async scheduleGiveway() {
    const guild = await this.client.guilds.fetch(
      this.config.get<string>('BOT_GUILD_ID'),
    );

    const members = await guild.members.fetch();

    let randomRows: stacjobotUsers[] = await this.prisma
      .$queryRaw`SELECT * FROM "stacjobotUsers" ORDER BY random() LIMIT 20;`;

    randomRows = randomRows.filter((row) =>
      members.some((m) => m.id == row.userId),
    );

    if (randomRows.length == 0) {
      this.webhookClient.send({
        content:
          'Losowanie przerwane z powodu brakującej liczby wymaganych uczestników :(',
      });

      return;
    }

    const kofolaEmoji = getEmojiByName('kofola2');
    const winners: { userId: string; amount: number }[] = [];

    for (
      let i = 0;
      i < Math.min(givewaySetup.drawCount, randomRows.length);
      i++
    ) {
      const user = randomRows[i];

      const randAmount = randomRange(
        givewaySetup.maxAmount,
        givewaySetup.minAmount,
      );

      if (isDevelopment()) {
        await this.prisma.stacjobotUsers.update({
          where: {
            userId: user.userId,
          },
          data: {
            kofolaCount: {
              increment: randAmount,
            },
          },
        });
      }

      winners.push({
        userId: user.userId,
        amount: randAmount,
      });
    }

    const winnerDisplay = winners.map((w) => {
      const dcMember = members.find((m) => m.id == w.userId);

      return `> - **${dcMember.displayName || dcMember.nickname}**: + ${
        w.amount
      }x ${kofolaEmoji}`;
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

  // 20:20
  @Cron('20 20 * * *', { timeZone: 'Europe/Warsaw' })
  async announceGiveway() {
    const bagietyEmoji = getEmojiByName('bagiety');

    givewaySetup.minAmount = randomRange(5, 1);
    givewaySetup.maxAmount = givewaySetup.minAmount + 2;
    givewaySetup.drawCount = randomRange(6, 3);

    this.webhookClient.send({
      content: `# ${bagietyEmoji} KOFOLOTERIA JUŻ ZA GODZINĘ! ${bagietyEmoji}\n## DZIŚ WYLOSUJEMY *${givewaySetup.drawCount} SZCZĘŚLIWCÓW* KTÓRZY DOSTANĄ DODATKOWY PRZYDZIAŁ KOFOLI!`,
    });
  }
}
