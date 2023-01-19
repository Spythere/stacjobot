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
import { SceneryPageBuilder } from '../page_builders/scenery-page-builder.service';

@Injectable()
@Command({
  name: 'schistory',
  description: 'Historia dyżurnych scenerii',
})
@UsePipes(TransformPipe)
export class scHistoryCmd implements DiscordTransformedCommand<ScHistoryDto> {
  constructor(private pageBuilder: SceneryPageBuilder) {}

  async handler(
    @Payload() dto: ScHistoryDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<InteractionReplyOptions> {
    const page = await this.pageBuilder.generateSceneryPage(dto.sceneryName, 1);
    return page;
  }
}
