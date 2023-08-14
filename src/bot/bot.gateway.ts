import { Injectable, Logger } from '@nestjs/common';
import { DiscordClientProvider, Once } from '@discord-nestjs/core';
import { ActivityType } from 'discord.js';
import { SceneryPageBuilder } from './page_builders/scenery-page-builder.service';
import { ScRjPageBuilder } from './page_builders/scrj-page-builder';
import { TimetablePageBuilder } from './page_builders/timetable-page-builder';
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
    sceneryPageBuilder: SceneryPageBuilder,
    timetablePageBuilder: TimetablePageBuilder,
    scRjPageBuilder: ScRjPageBuilder,
  ) {
    const client = discordClient.getClient();

    this.customCmdHandler = new CustomCommandHandler(client, prisma);
    this.interactionHandler = new InteractionHandler(
      client,
      this.logger,
      sceneryPageBuilder,
      timetablePageBuilder,
      scRjPageBuilder,
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
    this.customCmdHandler.handleCommands();

    // Interaction (buttons) handling
    this.interactionHandler.handleButtonInteraction();
  }
}
