import { Logger } from '@nestjs/common';
import { Client, Interaction, InteractionType } from 'discord.js';
import { SceneryPageBuilder } from '../page_builders/scenery-page-builder.service';
import { ScRjPageBuilder } from '../page_builders/scrj-page-builder';
import { TimetablePageBuilder } from '../page_builders/timetable-page-builder';

export class InteractionHandler {
  constructor(
    private readonly client: Client,
    private readonly logger: Logger,
    private sceneryPageBuilder: SceneryPageBuilder,
    private timetablePageBuilder: TimetablePageBuilder,
    private scRjPageBuilder: ScRjPageBuilder,
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

      if (!i.isButton()) return;

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
          await this.timetablePageBuilder.generateTimetablesPage(
            nickname,
            page,
          ),
        );
      }

      this.scRjPageBuilder.interactionController(i, customId);
    });
  }
}
