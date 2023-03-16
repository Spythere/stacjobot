import { SlashCommandPipe } from '@discord-nestjs/common';
import {
  Command,
  Handler,
  InteractionEvent,
  EventParams,
} from '@discord-nestjs/core';

import { ClientEvents, InteractionReplyOptions } from 'discord.js';

import { ScHistoryDto } from '../dto/schistory.dto';
import { SceneryPageBuilder } from '../page_builders/scenery-page-builder.service';

@Command({
  name: 'schistory',
  description: 'Historia dyżurnych scenerii',
})
export class scHistoryCmd {
  constructor(private pageBuilder: SceneryPageBuilder) {}

  @Handler()
  async onCommand(
    @InteractionEvent(SlashCommandPipe) dto: ScHistoryDto,
    @EventParams() args: ClientEvents['interactionCreate'],
  ): Promise<InteractionReplyOptions> {
    const page = await this.pageBuilder.generateSceneryPage(dto.sceneryName, 1);
    return page;
  }
}
