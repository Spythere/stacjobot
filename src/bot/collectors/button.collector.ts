import {
  Filter,
  InjectCauseEvent,
  InteractionEventCollector,
  On,
  Once,
} from '@discord-nestjs/core';
import { Injectable, Scope } from '@nestjs/common';
import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';
import { SceneryPageBuilder } from '../page_builders/scenery-page-builder.service';
import { ScRjPageBuilder } from '../page_builders/scrj-page-builder';
import { TimetablePageBuilder } from '../page_builders/timetable-page-builder';

@Injectable({ scope: Scope.REQUEST })
@InteractionEventCollector({})
export class ButtonInteractionCollector {
  constructor(
    @InjectCauseEvent()
    private readonly causeInteraction: ChatInputCommandInteraction,
    private sceneryPageBuilder: SceneryPageBuilder,
    private timetablePageBuilder: TimetablePageBuilder,
    private scRjPageBuilder: ScRjPageBuilder,
  ) {}

  @Filter()
  filter(interaction: ButtonInteraction): boolean {
    return this.causeInteraction.id === interaction.message.interaction.id;
  }

  @On('collect')
  async onCollect(i: ButtonInteraction): Promise<void> {
    if (!i.isButton()) return;

    // console.log(i.customId);

    const customId = i.customId;

    if (customId.startsWith('btn-scenery')) {
      const btnInfo = customId.split('-');
      const stationName = btnInfo[2];
      const pageNo = Number(btnInfo[3]);

      const page = await this.sceneryPageBuilder.generateSceneryPage(
        stationName,
        pageNo,
      );

      i.update(page);
    }

    if (customId.startsWith('btn-timetable')) {
      const btnInfo = customId.split('-');
      const nickname = btnInfo[2];
      const page = Number(btnInfo[3]);

      i.update(
        await this.timetablePageBuilder.generateTimetablesPage(nickname, page),
      );
    }

    this.scRjPageBuilder.interactionController(i, customId);
  }
}
