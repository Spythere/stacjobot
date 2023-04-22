import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { BotGateway } from './bot.gateway';

import { ApiModule } from '../api/api.module';
import { PrismaService } from '../prisma/prisma.service';
import { TimetablePageBuilder } from './page_builders/timetable-page-builder';
import { SceneryPageBuilder } from './page_builders/scenery-page-builder.service';

import { ScRjPageBuilder } from './page_builders/scrj-page-builder';
import { commandsIndex } from './commands';

@Module({
  imports: [DiscordModule.forFeature(), ApiModule],
  providers: [
    PrismaService,
    TimetablePageBuilder,
    SceneryPageBuilder,
    ScRjPageBuilder,
    BotGateway,
    ...commandsIndex,
  ],
})
export class BotModule {}
