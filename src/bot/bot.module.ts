import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { BotGateway } from './bot.gateway';

import { ApiModule } from '../api/api.module';
import { PrismaService } from '../prisma/prisma.service';
import { TimetablePageBuilder } from './page_builders/timetable-page-builder';
import { SceneryPageBuilder } from './page_builders/scenery-page-builder.service';

import { ScRjPageBuilder } from './page_builders/scrj-page-builder';
import { DrHistoryCmd } from './commands/drhistory.command';
import { DrInfoCmd } from './commands/drinfo.command';
import { DrTopCmd } from './commands/drtop.command';
import { konfCmd } from './commands/konfident.command';
import { rjIdCmd } from './commands/rjId.command';
import { rjInfoCmd } from './commands/rjinfo.command';
import { scHistoryCmd } from './commands/schistory.command';
import { scRjCmd } from './commands/scrj.command';
import { ScTopCmd } from './commands/sctop.command';
import { violationsCmd } from './commands/violations.command';

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
    violationsCmd,
  ],
})
export class BotModule {}
