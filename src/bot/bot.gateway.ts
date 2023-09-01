import { Injectable, Logger } from '@nestjs/common';
import { DiscordClientProvider, Once } from '@discord-nestjs/core';
import { ActivityType } from 'discord.js';
import { CustomCommandHandler } from './handlers/CustomCommandHandler';
import { InteractionHandler } from './handlers/InteractionHandler';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger('DiscordBot');

  private readonly customCmdHandler: CustomCommandHandler;
  private readonly interactionHandler: InteractionHandler;

  constructor(
    private readonly discordClient: DiscordClientProvider,
    private readonly prisma: PrismaService,
  ) {
    const client = discordClient.getClient();

    this.customCmdHandler = new CustomCommandHandler(
      client,
      prisma,
      this.logger,
    );

    this.interactionHandler = new InteractionHandler(client, this.logger);
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
    this.customCmdHandler.handleCommands();

    // Interaction (buttons) handling
    this.interactionHandler.handleButtonInteraction();
  }
}
