import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { InjectDiscordClient, On, Once } from '@discord-nestjs/core';
import {
  ActivityType,
  ChatInputCommandInteraction,
  Client,
  Interaction,
  InteractionType,
  Message,
  WebhookClient,
} from 'discord.js';
import { PrefixCommandHandler } from './handlers/PrefixCommandHandler';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdministratorCommandGuard,
  PrefixCommandGuard,
} from './guards/command.guard';
import { ConfigService } from '@nestjs/config';
import { collectEmojis } from './utils/emojiUtils';
import { Cron } from '@nestjs/schedule';
import { KofolaGiveway } from './serverEvents/giveway-event.service';
import { isDevelopment } from './utils/envUtils';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger('DiscordBot');

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly giveway: KofolaGiveway,
    private readonly customCmdHandler: PrefixCommandHandler,
  ) {}

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
  }

  @On('interactionCreate')
  async onInteraction(i: Interaction) {
    if (i.type == InteractionType.ApplicationCommand)
      this.logSlashCommand(i as ChatInputCommandInteraction);
  }

  @On('messageCreate')
  @UseGuards(PrefixCommandGuard)
  async onPrefixCommand(message: Message) {
    this.customCmdHandler.handleCommands(message);
  }

  @On('messageCreate')
  @UseGuards(AdministratorCommandGuard)
  async onMessage(message: Message) {
    if (message.content == '!test' && isDevelopment())
      this.giveway.runGiveway();
  }

  // 21:37
  @Cron('37 21 * * *', { timeZone: 'Europe/Warsaw' })
  async scheduleGiveway() {
    this.giveway.runGiveway();
  }
}
