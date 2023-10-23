import { EmbedBuilder } from 'discord.js';
import { DrNickDto } from '../dto/drnick.dto';
import { ApiService } from '../../api/api.service';
import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
import { SlashCommandPipe } from '@discord-nestjs/common';
import { TimestampUtils } from '../utils/timestampUtils';
import { IDispatchersWithCount } from '../../api/interfaces/dispatcher.interface';
import { LoggerService } from '@nestjs/common';

@Command({
  name: 'drhistory',
  description: 'Historia dyżurów gracza',
})
export class DrHistoryCmd {
  constructor(private readonly apiService: ApiService) {}

  @Handler()
  async onCommand(@InteractionEvent(SlashCommandPipe) dto: DrNickDto) {
    let responseData: IDispatchersWithCount;

    try {
      responseData = (
        await this.apiService.getDispatchersWithCount({
          dispatcherName: dto.nick,
          countLimit: 24,
        })
      ).data;
    } catch (error) {
      return {
        content: 'Ups! Coś poszło nie tak podczas przetwarzania komendy!',
        ephemeral: true,
      };
    }

    const { dispatchers, count } = responseData;

    if (dispatchers.length == 0 || count == 0)
      return {
        content: 'Brak informacji na temat tego dyżurnego!',
        ephemeral: true,
      };

    const dispatcherName = dispatchers[0].dispatcherName;

    const embed = new EmbedBuilder()
      .setTitle(`Historia dyżurnego ${dispatcherName}`)
      .setColor('Random')
      .setDescription(
        'Wyświetlanych jest maksymalnie 24 najnowszych wpisów w bazie',
      )
      .addFields([
        {
          name: 'Zapisane dyżury',
          value: `${count}`,
        },
        ...dispatchers.map((historyRecord) => {
          const dateFrom = TimestampUtils.getDiscordTimestamp(
            historyRecord.timestampFrom,
            'D',
          );

          const timeFrom = TimestampUtils.getDiscordTimestamp(
            historyRecord.timestampFrom,
            't',
          );

          const timeTo = historyRecord.timestampTo
            ? TimestampUtils.getDiscordTimestamp(historyRecord.timestampTo, 't')
            : '';

          return {
            name: historyRecord.stationName,
            value: `${dateFrom}\nod: ${timeFrom} ${
              timeTo ? `do: ${timeTo}` : '(online)'
            }`,
            inline: true,
          };
        }),
      ])
      .setFooter({
        text: `Statystyki dyżurnego dostępne pod /drinfo ${dispatcherName}`,
      });

    return {
      embeds: [embed],
    };
  }
}
