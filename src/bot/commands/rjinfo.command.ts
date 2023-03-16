import { SlashCommandPipe } from '@discord-nestjs/common';
import {
  Command,
  Handler,
  InteractionEvent,
  EventParams,
} from '@discord-nestjs/core';

import { RjNickDto } from '../dto/rjnick.dto';
import { ClientEvents, InteractionReplyOptions } from 'discord.js';
import { TimetablePageBuilder } from '../page_builders/timetable-page-builder';

@Command({
  name: 'rjinfo',
  description: 'Zapisane rozkłady jazdy maszynisty',
})
export class rjInfoCmd {
  constructor(private pageBuilder: TimetablePageBuilder) {}

  @Handler()
  async onCommand(
    @InteractionEvent(SlashCommandPipe) dto: RjNickDto,
    @EventParams() args: ClientEvents['interactionCreate'],
  ): Promise<InteractionReplyOptions> {
    return await this.pageBuilder.generateTimetablesPage(dto.nick, 1);
  }
}
