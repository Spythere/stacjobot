import { CollectorInterceptor, SlashCommandPipe } from '@discord-nestjs/common';
import {
  Command,
  Handler,
  IA,
  InteractionEvent,
  UseCollectors,
} from '@discord-nestjs/core';

import { InteractionReplyOptions } from 'discord.js';

import { ScHistoryDto } from '../dto/schistory.dto';
import { ScRjPageBuilder } from '../page_builders/scrj-page-builder';
import { UseInterceptors } from '@nestjs/common';
import { ButtonInteractionCollector } from '../collectors/button.collector';

@Command({
  name: 'scrj',
  description: 'Historia rozkładów jazdy wystawionych na scenerii',
})
@UseInterceptors(CollectorInterceptor)
@UseCollectors(ButtonInteractionCollector)
export class scRjCmd {
  constructor(private pageBuilder: ScRjPageBuilder) {}

  @Handler()
  async onCommand(
    @IA(SlashCommandPipe) dto: ScHistoryDto,
  ): Promise<InteractionReplyOptions> {
    const page = await this.pageBuilder.generateSceneryPage(dto.sceneryName, 1);
    return page;
  }
}
