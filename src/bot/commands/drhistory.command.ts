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
    const { history, historyStats, dispatcherName } = (
      await this.apiService.getDispatcherHistory(dto.nick)
    ).data;

    if (history.length == 0 || historyStats._count._all == 0)
      return {
        content: 'Brak informacji na temat tego dyżurnego!',
        ephemeral: true,
      };

    const embed = new EmbedBuilder()
      .setTitle(`Historia dyżurnego ${dispatcherName}`)
      .setColor('Random')
      .setDescription(
        'Wyświetlanych jest maksymalnie 15 najnowszych wpisów w bazie',
      )
      .addFields([
        {
          name: 'Zapisane dyżury',
          value: historyStats._count._all.toString(),
        },
        ...history.map((historyRecord) => ({
          name: historyRecord.stationName.toString(),
          value: `<t:${Math.round(
            historyRecord.timestampFrom.valueOf() / 1000,
          )}:D> <t:${Math.round(
            historyRecord.timestampFrom.valueOf() / 1000,
          )}:t>-<t:${Math.round(
            historyRecord.timestampTo.valueOf() / 1000,
          )}:t>`,
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
