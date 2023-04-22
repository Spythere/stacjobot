import {
  ClientEvents,
  EmbedBuilder,
  InteractionReplyOptions,
} from 'discord.js';
import { DrNickDto } from '../dto/drnick.dto';
import { ApiService } from '../../api/api.service';
import { SlashCommandPipe } from '@discord-nestjs/common';
import {
  Command,
  Handler,
  InteractionEvent,
  EventParams,
} from '@discord-nestjs/core';
import { DriverUtils } from '../utils/driverUtils';

@Command({
  name: 'drinfo',
  description: 'Statystyki dyżurnego',
})
export class DrInfoCmd {
  constructor(private readonly apiService: ApiService) {}

  @Handler()
  async onCommand(
    @InteractionEvent(SlashCommandPipe) dto: DrNickDto,
  ): Promise<InteractionReplyOptions> {
    const drData = await Promise.all([
      this.apiService.getDispatcherInfo(dto.nick),
      this.apiService.getTimetables({
        authorName: dto.nick,
        countLimit: 10,
      }),
    ]);

    const drStats = drData[0].data;
    const drTimetables = drData[1].data;

    if (
      drTimetables.length == 0 ||
      !drStats._max.authorName ||
      drStats._count._all == 0
    )
      return {
        content: 'Brak informacji na temat tego dyżurnego!',
        ephemeral: true,
      };

    const embed = new EmbedBuilder()
      .setTitle(`Statystyki dyżurnego ${drStats._max.authorName}`)
      .setColor('Random')
      .setDescription('Statystyki ruchu i ostatnio wystawione rozkłady jazdy')
      .addFields([
        {
          name: 'Wystawione rozkłady jazdy',
          value: drStats._count._all.toString(),
        },
        {
          name: 'Suma kilometrów wystawionych RJ',
          value: drStats._sum.routeDistance.toFixed(2) + 'km',
        },
        {
          name: 'Maksymalna długość RJ',
          value: drStats._max.routeDistance.toFixed(2) + 'km',
          inline: true,
        },
        {
          name: 'Średnia długość RJ ',
          value: drStats._avg.routeDistance.toFixed(2) + 'km',
          inline: true,
        },
        {
          name: 'Minimalna długość RJ ',
          value: drStats._min.routeDistance.toFixed(2) + 'km',
          inline: true,
        },
        {
          name: 'Ostatnie rozkłady jazdy',
          value: DriverUtils.timetablesFieldValue(drTimetables),
        },
      ])
      .setFooter({
        text: `Historia dyżurów dostępna pod /drhistory ${drStats._max.authorName}`,
      });
    return {
      embeds: [embed],
    };
  }
}
