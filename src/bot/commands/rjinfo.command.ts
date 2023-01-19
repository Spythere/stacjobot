import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UsePipes,
} from '@discord-nestjs/core';

import { TransformPipe } from '@discord-nestjs/common';
import { Injectable } from '@nestjs/common';
import { RjNickDto } from '../dto/rjnick.dto';
import { InteractionReplyOptions } from 'discord.js';
import { TimetablePageBuilder } from '../page_builders/timetable-page-builder';

@Injectable()
@Command({
  name: 'rjinfo',
  description: 'Zapisane rozkłady jazdy maszynisty',
})
@UsePipes(TransformPipe)
export class rjInfoCmd implements DiscordTransformedCommand<RjNickDto> {
  constructor(private pageBuilder: TimetablePageBuilder) {}

  async handler(
    @Payload() dto: RjNickDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<InteractionReplyOptions> {
    return await this.pageBuilder.generateTimetablesPage(dto.nick, 1);
  }
}
