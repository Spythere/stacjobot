import { SlashCommandPipe } from '@discord-nestjs/common';
import {
  Command,
  Handler,
  InteractionEvent,
  EventParams,
} from '@discord-nestjs/core';

import { ClientEvents, InteractionReplyOptions } from 'discord.js';

import { ScHistoryDto } from '../dto/schistory.dto';
import { ScRjPageBuilder } from '../page_builders/scrj-page-builder';

@Command({
  name: 'scrj',
  description: 'Historia rozkładów jazdy wystawionych na scenerii',
})
export class scRjCmd {
  constructor(private pageBuilder: ScRjPageBuilder) {}

  @Handler()
  async onCommand(
    @InteractionEvent(SlashCommandPipe) dto: ScHistoryDto,
    @EventParams() args: ClientEvents['interactionCreate'],
  ): Promise<InteractionReplyOptions> {
    const page = await this.pageBuilder.generateSceneryPage(dto.sceneryName, 1);
    return page;
  }
}
