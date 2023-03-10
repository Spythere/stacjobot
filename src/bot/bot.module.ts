import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { BotGateway } from './bot.gateway';
import {
  DrHistoryCmd,
  DrInfoCmd,
  DrTopCmd,
  rjIdCmd,
  scHistoryCmd,
  scRjCmd,
} from './commands';

import { konfCmd } from './commands/konfident.command';
import { ScTopCmd } from './commands/sctop.command';
import { ApiModule } from '../api/api.module';
import { PrismaService } from '../prisma/prisma.service';
import { rjInfoCmd } from './commands/rjinfo.command';
import { TimetablePageBuilder } from './page_builders/timetable-page-builder';
import { SceneryPageBuilder } from './page_builders/scenery-page-builder.service';
import { ScRjPageBuilder } from './page_builders/scrj-page-builder';

@Module({
  imports: [DiscordModule.forFeature(), ApiModule],
  providers: [
    PrismaService,
    TimetablePageBuilder,
    SceneryPageBuilder,
    ScRjPageBuilder,
    BotGateway,
    DrHistoryCmd,
    DrInfoCmd,
    DrTopCmd,
    rjIdCmd,
    rjInfoCmd,
    scHistoryCmd,
    scRjCmd,
    ScTopCmd,
    konfCmd,
  ],
})
export class BotModule {}
