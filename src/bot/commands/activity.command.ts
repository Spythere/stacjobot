import {
  APIEmbedField,
  ClientEvents,
  EmbedBuilder,
  EmbedField,
  InteractionReplyOptions,
} from 'discord.js';

import { ApiService } from '../../api/api.service';
import { SlashCommandPipe } from '@discord-nestjs/common';
import {
  Command,
  Handler,
  InteractionEvent,
  EventParams,
} from '@discord-nestjs/core';
import { KonfDto } from '../dto/konfident.dto';
import { DispatcherHistoryData } from '../../api/models/dispatcherHistory.interface';
import { DriverInfoData } from '../../api/models/driverInfo.interface';
import { TimetableData } from '../../api/models/timetable.interface';
import { getDiscordTimeFormat } from '../../utils/discordTimestampUtils';
import { DriverUtils } from '../utils/driverUtils';

@Command({
  name: 'activity',
  description: 'Historia aktywności użytkownika',
})
export class activityCmd {
  constructor(private apiService: ApiService) {}

  @Handler()
  async onCommand(
    @InteractionEvent(SlashCommandPipe) dto: KonfDto,
  ): Promise<InteractionReplyOptions> {
    let dispatcherData: DispatcherHistoryData;
    let driverData: TimetableData[];
    let authorData: TimetableData[];

    try {
      const [dispatcherResponse, driverResponse, authorResponse] =
        await Promise.all([
          this.apiService.getDispatcherHistory(dto.nick),
          this.apiService.getTimetables({
            driverName: dto.nick,
            countLimit: 10,
          }),
          this.apiService.getTimetables({
            authorName: dto.nick,
            countLimit: 10,
          }),
        ]);

      dispatcherData = dispatcherResponse.data;
      driverData = driverResponse.data;
      authorData = authorResponse.data;
    } catch (error) {
      console.error(error);

      return {
        content: 'Ups! Coś poszło nie tak podczas przetwarzania komendy!',
      };
    }

    const embed = new EmbedBuilder()
      .setTitle(
        `Teczka aktywności użytkownika ${dispatcherData.dispatcherName}`,
      )
      .setColor('Random')
      .setDescription(
        'Najświeższa historia aktywności użytkownika w trybach dyżurnego i maszynisty',
      );

    const embedDispatcherHistory = dispatcherData.history.map((record) => {
      const dateFrom = getDiscordTimeFormat(record.timestampFrom, 'date');
      const timeFrom = getDiscordTimeFormat(record.timestampFrom, 'time');
      const timeTo = getDiscordTimeFormat(record.timestampTo, 'time');

      return `${record.stationName}: ${dateFrom} ${timeFrom} - ${timeTo}`;
    });

    embed.addFields([
      {
        name: 'MASZYNISTA - ROZKŁADY JAZDY',
        value: driverData
          .map(
            (tt) =>
              `\n${getDiscordTimeFormat(
                new Date(tt.beginDate).getTime(),
                'long',
              )}\n#${tt.id} | ${tt.trainCategoryCode} ${tt.trainNo} (${
                tt.routeDistance
              }km) [${tt.fulfilled ? 'V' : 'X'}]\n${tt.route.replace(
                '|',
                ' -> ',
              )}\nAutor: ${tt.authorName || '(brak)'}`,
          )
          .join('\n'),
        inline: true,
      },
      {
        name: 'DYŻURNY - ROZKŁADY JAZDY',
        value: authorData
          .map(
            (tt) =>
              `\n${getDiscordTimeFormat(
                new Date(tt.beginDate).getTime(),
                'long',
              )}\n#${tt.id} | ${tt.trainCategoryCode} ${tt.trainNo} (${
                tt.routeDistance
              }km) [${tt.fulfilled ? 'V' : 'X'}]\n${tt.route.replace(
                '|',
                ' -> ',
              )}\nDla: ${tt.driverName}`,
          )
          .join('\n'),
        inline: true,
      },
      {
        name: 'DYŻURNY - SŁUŻBY',
        value: embedDispatcherHistory.join('\n'),
      },
    ]);

    return {
      embeds: [embed],
    };
  }
}
