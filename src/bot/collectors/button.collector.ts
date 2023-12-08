import { Filter, InjectCauseEvent, InteractionEventCollector, On } from '@discord-nestjs/core';
import { Injectable, Scope } from '@nestjs/common';
import { ButtonInteraction, ChatInputCommandInteraction, InteractionUpdateOptions } from 'discord.js';
import { PageBuilderService } from '../page_builders/builder.service';
import { BuilderId, builderIds } from '../page_builders/builder.interfaces';

@Injectable({ scope: Scope.REQUEST })
@InteractionEventCollector({})
export class ButtonInteractionCollector {
  constructor(
    @InjectCauseEvent()
    private readonly causeInteraction: ChatInputCommandInteraction,
    private readonly pageBuilder: PageBuilderService,
  ) {}

  // private sceneryPageBuilder: SceneryPageBuilder,
  // private timetablePageBuilder: TimetablePageBuilder,

  @Filter()
  filter(interaction: ButtonInteraction): boolean {
    return this.causeInteraction.id === interaction.message.interaction.id;
  }

  @On('collect')
  async onCollect(i: ButtonInteraction): Promise<void> {
    if (!i.isButton()) return;

    const customId = i.customId;
    const btnInfo = customId.split('-');
    const id = btnInfo[0];

    if (btnInfo.length == 0) return;
    if (!builderIds.includes(id as any)) return;

    const name = btnInfo[1];
    const pageNo = Number(btnInfo[2]);

    i.update(await this.pageBuilder.generatePage(id as BuilderId, name, pageNo));
  }
}
