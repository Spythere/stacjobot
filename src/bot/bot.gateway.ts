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
    // if (isDevelopment()) this.scheduleGiveway();
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
      // message.reply('Yeah');
      this.scheduleGiveway();
    }
  }

  // @Cron('40 * * * * *')
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

    const winners: string[] = [];

    for (let i = 0; i < Math.min(5, randomRows.length); i++) {
      const toplistUser = randomRows[i];
      const dcMember = members.find((m) => m.id == toplistUser.userId);

      const randAmount = randomRange(4, 1);

      winners.push(
        `> - <@${toplistUser.userId}> (${
          dcMember?.nickname || dcMember?.displayName || '???'
        }): ${randAmount}x`,
      );
    }

    const kofola = getEmojiByName('kofola2');

    const timestamp = ~~(Date.now() / 1000);
    const contentLines = [
      `# ${kofola} __STACJOWNIKOWA KOFOLOTERIA DNIA__ <t:${timestamp}:D> ${kofola}`,
      '# Dzisiejszymi zwycięzcami są:',
      winners.join('\n'),
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
