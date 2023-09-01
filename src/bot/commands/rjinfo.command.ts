import { CollectorInterceptor, SlashCommandPipe } from '@discord-nestjs/common';
import {
  Command,
  Handler,
  InteractionEvent,
  UseCollectors,
} from '@discord-nestjs/core';

import { RjNickDto } from '../dto/rjnick.dto';
import { InteractionReplyOptions } from 'discord.js';
import { TimetablePageBuilder } from '../page_builders/timetable-page-builder';
import { UseInterceptors } from '@nestjs/common';
import { ButtonInteractionCollector } from '../collectors/button.collector';

@Command({
  name: 'rjinfo',
  description: 'Zapisane rozkłady jazdy maszynisty',
})
@UseInterceptors(CollectorInterceptor)
@UseCollectors(ButtonInteractionCollector)
export class rjInfoCmd {
  constructor(private pageBuilder: TimetablePageBuilder) {}

  @Handler()
  async onCommand(
    @InteractionEvent(SlashCommandPipe) dto: RjNickDto,
  ): Promise<InteractionReplyOptions> {
    return await this.pageBuilder.generateTimetablesPage(dto.nick, 1);
  }
}
