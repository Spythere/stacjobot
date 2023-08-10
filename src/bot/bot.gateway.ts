import { Injectable, Logger } from '@nestjs/common';
import { DiscordClientProvider, Once } from '@discord-nestjs/core';
import {
  ActivityType,
  Interaction,
  InteractionType,
  Message,
} from 'discord.js';
import { SceneryPageBuilder } from './page_builders/scenery-page-builder.service';
import { ScRjPageBuilder } from './page_builders/scrj-page-builder';
import { TimetablePageBuilder } from './page_builders/timetable-page-builder';

function randomMuteUser(message: Message) {
  const randMinutes = ~~(Math.random() * (60 - 3) + 3);

  message.member
    .timeout(randMinutes * 60 * 1000)
    .then(() => {
      message.reply(
        `Gratulacje, <@${message.member.id}>! Dostałeś ${randMinutes}m przerwy! <a:rewident:1108083125147406389>`,
      );

      message.react('<a:rewident:1108083125147406389>');
    })
    .catch(() => {
      message.reply(
        'Niestety, obecny reżim nie pozwala na mutowanie oficjeli na wysokich stanowiskach! <a:bagiety:1084565542930751649>',
      );
    });
}

const customCommands = {
  '!dajmute': randomMuteUser,
};

@Injectable()
export class BotGateway {
  private readonly logger = new Logger('DiscordBot');

  constructor(
    private readonly discordClient: DiscordClientProvider,
    private sceneryPageBuilder: SceneryPageBuilder,
    private timetablePageBuilder: TimetablePageBuilder,
    private scRjPageBuilder: ScRjPageBuilder,
  ) {}

  @Once('ready')
  onReady() {
    this.logger.log('Bot was started!');

    this.discordClient.getClient().user.setActivity({
      name: 'Train Driver 2',
      type: ActivityType.Playing,
      url: 'https://stacjownik-td2.web.app',
    });

    // Custom commands handling
    this.discordClient.getClient().on('messageCreate', async (message) => {
      const isContentCustomCommand = message.content in customCommands;

      if (isContentCustomCommand) {
        customCommands[message.content](message);
      }
    });

    this.discordClient
      .getClient()
      .on('interactionCreate', async (i: Interaction) => {
        if (i.type == InteractionType.ApplicationCommand) {
          this.logger.log(
            `${i.user.username} (${i.user.id}): /${
              i.commandName
            } ${i.options.data
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
