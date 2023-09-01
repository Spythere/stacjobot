import { CollectorInterceptor, SlashCommandPipe } from '@discord-nestjs/common';
import { Command, Handler, IA, UseCollectors } from '@discord-nestjs/core';

import { InteractionReplyOptions } from 'discord.js';

import { ScHistoryDto } from '../dto/schistory.dto';
import { SceneryPageBuilder } from '../page_builders/scenery-page-builder.service';
import { ButtonInteractionCollector } from '../collectors/button.collector';
import { UseInterceptors } from '@nestjs/common';

@Command({
  name: 'schistory',
  description: 'Historia dyżurnych scenerii',
})
@UseInterceptors(CollectorInterceptor)
@UseCollectors(ButtonInteractionCollector)
export class scHistoryCmd {
  constructor(private pageBuilder: SceneryPageBuilder) {}

  @Handler()
  async onCommand(
    @IA(SlashCommandPipe) dto: ScHistoryDto,
  ): Promise<InteractionReplyOptions> {
    const page = await this.pageBuilder.generateSceneryPage(dto.sceneryName, 1);
    return page;
  }
}
