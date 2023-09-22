import { EmbedBuilder } from 'discord.js';
import { DrNickDto } from '../dto/drnick.dto';
import { ApiService } from '../../api/api.service';
import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
import { SlashCommandPipe } from '@discord-nestjs/common';

@Command({
  name: 'drhistory',
  description: 'Historia dyżurów gracza',
})
export class DrHistoryCmd {
  constructor(private readonly apiService: ApiService) {}

  @Handler()
  async onCommand(@InteractionEvent(SlashCommandPipe) dto: DrNickDto) {
    const { dispatchers: dispatcherHistory, count } = (
      await this.apiService.getDispatchersWithCount({
        dispatcherName: dto.nick,
      })
    ).data;

    if (dispatcherHistory.length == 0 || count == 0)
      return {
        content: 'Brak informacji na temat tego dyżurnego!',
        ephemeral: true,
      };

    const dispatcherName = dispatcherHistory[0].dispatcherName;

    const embed = new EmbedBuilder()
      .setTitle(`Historia dyżurnego ${dispatcherName}`)
      .setColor('Random')
      .setDescription(
        'Wyświetlanych jest maksymalnie 15 najnowszych wpisów w bazie',
      )
      .addFields([
        {
          name: 'Zapisane dyżury',
          value: `${count}`,
        },
        ...dispatcherHistory.map((historyRecord) => ({
          name: historyRecord.stationName,
          value: `<t:${Math.round(
            historyRecord.timestampFrom.valueOf() / 1000,
          )}:D> <t:${Math.round(
            historyRecord.timestampFrom.valueOf() / 1000,
          )}:t>-<t:${Math.round(
            historyRecord.timestampTo.valueOf() / 1000,
          )}:t>`,
          inline: true,
        })),
      ])
      .setFooter({
        text: `Statystyki dyżurnego dostępne pod /drinfo ${dispatcherName}`,
      });

    return {
      embeds: [embed],
    };
  }
}
