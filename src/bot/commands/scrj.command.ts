import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UsePipes,
} from '@discord-nestjs/core';

import { TransformPipe } from '@discord-nestjs/common';
import { Injectable } from '@nestjs/common';
import { InteractionReplyOptions } from 'discord.js';
import { ScHistoryDto } from '../dto/schistory.dto';
import { ScRjPageBuilder } from '../page_builders/scrj-page-builder';

@Injectable()
@Command({
  name: 'scrj',
  description: 'Historia rozkładów jazdy wystawionych na scenerii',
})
@UsePipes(TransformPipe)
export class scRjCmd implements DiscordTransformedCommand<ScHistoryDto> {
  constructor(private pageBuilder: ScRjPageBuilder) {}

  async handler(
    @Payload() dto: ScHistoryDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<InteractionReplyOptions> {
    const page = await this.pageBuilder.generateSceneryPage(dto.sceneryName, 1);
    return page;
  }
}
