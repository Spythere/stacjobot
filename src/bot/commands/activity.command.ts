import { Colors, EmbedBuilder, InteractionReplyOptions } from 'discord.js';

import { ApiService } from '../../api/api.service';
import { SlashCommandPipe } from '@discord-nestjs/common';
import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
import { KonfDto } from '../dto/konfident.dto';
import { IDispatcherHistoryData } from '../../api/interfaces/dispatcherHistory.interface';
import { ITimetable } from '../../api/interfaces/timetable.interface';
import { getDiscordTimeFormat } from '../../utils/discordTimestampUtils';

@Command({
  name: 'activity',
  description: 'Historia aktywności użytkownika',
})
export class ActivityCmd {
  constructor(private apiService: ApiService) {}

  @Handler()
  async onCommand(
    @InteractionEvent(SlashCommandPipe) dto: KonfDto,
  ): Promise<InteractionReplyOptions> {
    let dispatcherData: IDispatcherHistoryData;
    let driverData: ITimetable[];
    let authorData: ITimetable[];
    let username = '';

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

      username =
        dispatcherData.dispatcherName ||
        (authorData.length > 0 ? authorData[0].authorName : '') ||
        (driverData.length > 0 ? driverData[0].driverName : '');
    } catch (error) {
      console.error(error);

      return {
        content: 'Ups! Coś poszło nie tak podczas przetwarzania komendy!',
      };
    }

    if (!username)
      return {
        content: 'Brak informacji o podanym użytkowniku!',
        ephemeral: true,
      };

    const driverEmbed = new EmbedBuilder()
      .setColor(Colors.Blurple)
      .setTitle(`MASZYNISTA - ROZKŁADY JAZDY`);

    if (driverData.length == 0)
      driverEmbed.setDescription('Brak informacji o rozkładach jazdy');
    else
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
      .setTitle('DYŻURNY - ROZKŁADY JAZDY');

    if (authorData.length == 0)
      dispatcherEmbed.setDescription(
        'Brak informacji o wystawionych rozkładach jazdy',
      );
    else
      dispatcherEmbed.addFields(
        authorData.map((tt) => ({
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

      return {
        name: record.stationName,
        value: `${dateFrom} ${timeFrom} - ${timeTo}`,
        inline: true,
      };
    });

    const serviceEmbed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setTitle('DYŻURNY - SŁUŻBY');

    if (dispatcherData.history.length == 0)
      serviceEmbed.setDescription('Brak informacji o dyżurach');
    else serviceEmbed.addFields(embedServiceHistory);

    return {
      content: `# Teczka aktywności użytkownika ${username}`,
      embeds: [driverEmbed, dispatcherEmbed, serviceEmbed],
    };
  }
}
