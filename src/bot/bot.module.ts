import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { BotGateway } from './bot.gateway';

import { ApiModule } from '../api/api.module';
import { PrismaService } from '../prisma/prisma.service';
import { TimetablePageBuilder } from './page_builders/rjinfo-page-builder';
import { SceneryPageBuilder } from './page_builders/schistory-page-builder.service';

import { commandsIndex } from './commands';
import { PageBuilderService } from './page_builders/builder.service';
import { KofolaGiveway } from './serverEvents/giveway-event.service';
import { PrefixCommandHandler } from './handlers/PrefixCommandHandler';
import { DailyStatsOverview } from './serverEvents/daily-stats-event.service';
import { EmojiCommandHandler } from './handlers/EmojiCommandHandler';

@Module({
  imports: [DiscordModule.forFeature(), ApiModule],
  providers: [
    PrismaService,
    PageBuilderService,
    TimetablePageBuilder,
    SceneryPageBuilder,
    BotGateway,
    PrefixCommandHandler,
    EmojiCommandHandler,
    KofolaGiveway,
    DailyStatsOverview,
    ...commandsIndex,
  ],
})
export class BotModule {}
