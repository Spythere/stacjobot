import { Logger } from '@nestjs/common';
import { Client, Interaction, InteractionType } from 'discord.js';
import { SceneryPageBuilder } from '../page_builders/scenery-page-builder.service';
import { ScRjPageBuilder } from '../page_builders/scrj-page-builder';
import { TimetablePageBuilder } from '../page_builders/timetable-page-builder';

export class InteractionHandler {
  constructor(
    private readonly client: Client,
    private readonly logger: Logger,
  ) {}

  public handleButtonInteraction() {
    this.client.on('interactionCreate', async (i: Interaction) => {
      if (i.type == InteractionType.ApplicationCommand) {
        this.logger.log(
          `${i.user.username} (${i.user.id}): /${i.commandName} ${i.options.data
            .map((param) => `${param.name}: ${param.value}`)
            .join(' ')}`,
        );
      }
    });
  }
}
