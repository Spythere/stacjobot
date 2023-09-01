import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { DiscordClientProvider, On, Once } from '@discord-nestjs/core';
import {
  ActivityType,
  ChatInputCommandInteraction,
  Interaction,
  InteractionType,
  Message,
} from 'discord.js';
import { CustomCommandHandler } from './handlers/CustomCommandHandler';
import { PrismaService } from '../prisma/prisma.service';
import { CustomCommandGuard } from './guards/command.guard';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger('DiscordBot');

  private readonly customCmdHandler: CustomCommandHandler;

  constructor(
    private readonly discordClient: DiscordClientProvider,
    private readonly prisma: PrismaService,
  ) {
    this.customCmdHandler = new CustomCommandHandler(prisma, this.logger);
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

    this.discordClient.getClient().user.setActivity({
      name: 'Train Driver 2',
      type: ActivityType.Playing,
      url: 'https://stacjownik-td2.web.app',
    });

    // Custom commands handling
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
  }
}
