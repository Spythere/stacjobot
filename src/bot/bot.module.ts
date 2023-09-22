import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { BotGateway } from './bot.gateway';

import { ApiModule } from '../api/api.module';
import { PrismaService } from '../prisma/prisma.service';
import { TimetablePageBuilder } from './page_builders/rjinfo-page-builder';
import { SceneryPageBuilder } from './page_builders/schistory-page-builder.service';

import { commandsIndex } from './commands';
import { PageBuilderService } from './page_builders/builder.service';

@Module({
  imports: [DiscordModule.forFeature(), ApiModule],
  providers: [
    PrismaService,
    PageBuilderService,
    TimetablePageBuilder,
    SceneryPageBuilder,
    BotGateway,
    ...commandsIndex,
  ],
})
export class BotModule {}
