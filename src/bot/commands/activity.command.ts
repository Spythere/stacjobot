import { Colors, EmbedBuilder, InteractionReplyOptions } from 'discord.js';

import { ApiService } from '../../api/api.service';
import { SlashCommandPipe } from '@discord-nestjs/common';
import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
import { KonfDto } from '../dto/konfident.dto';
import { DispatcherHistoryData } from '../../api/models/dispatcherHistory.interface';
import { TimetableData } from '../../api/models/timetable.interface';
import { getDiscordTimeFormat } from '../../utils/discordTimestampUtils';

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

    const driverEmbed = new EmbedBuilder()
      .setColor(Colors.Blurple)
      .setTitle(`MASZYNISTA - ROZKŁADY JAZDY`);
    // .setDescription(
    //   'Najświeższa historia aktywności użytkownika w trybach dyżurnego i maszynisty',
    // );

    driverEmbed.addFields(
      driverData.map((tt) => ({
        name: `#${tt.id} | ${tt.trainCategoryCode} ${tt.trainNo} (${
          tt.routeDistance
        }km) [${tt.fulfilled ? 'V' : 'X'}]`,
        value: `${getDiscordTimeFormat(
          new Date(tt.beginDate).getTime(),
          'long',
        )}\n${tt.route.replace('|', ' -> ')}\nAutor: ${
          tt.authorName || '(brak)'
        }`,
        inline: true,
      })),
    );

    const dispatcherEmbed = new EmbedBuilder()
      .setColor(Colors.Red)
      .setTitle('DYŻURNY - ROZKŁADY JAZDY')
      .addFields(
        authorData.map((tt, i) => ({
          name: `#${tt.id} | ${tt.trainCategoryCode} ${tt.trainNo} (${
            tt.routeDistance
          }km) [${tt.fulfilled ? 'V' : 'X'}]`,
          value: `${getDiscordTimeFormat(
            new Date(tt.beginDate).getTime(),
            'long',
          )}\n${tt.route.replace('|', ' -> ')}\nDla: ${tt.driverName}`,
          inline: true,
        })),
      );

    const embedServiceHistory = dispatcherData.history.map((record) => {
      const dateFrom = getDiscordTimeFormat(record.timestampFrom, 'date');
      const timeFrom = getDiscordTimeFormat(record.timestampFrom, 'time');
      const timeTo = getDiscordTimeFormat(record.timestampTo, 'time');

      // return `${record.stationName}: ${dateFrom} ${timeFrom} - ${timeTo}`;
      return {
        name: record.stationName,
        value: `${dateFrom} ${timeFrom} - ${timeTo}`,
        inline: true,
      };
    });

    const serviceEmbed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setTitle('DYŻURNY - SŁUŻBY')
      .addFields(embedServiceHistory);

    return {
      content: `# Teczka aktywności użytkownika ${dispatcherData.dispatcherName}`,
      embeds: [driverEmbed, dispatcherEmbed, serviceEmbed],
    };
  }
}
