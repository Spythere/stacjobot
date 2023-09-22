import { EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { DrNickDto } from '../dto/drnick.dto';
import { ApiService } from '../../api/api.service';
import { SlashCommandPipe } from '@discord-nestjs/common';
import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
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
    const drStats = (await this.apiService.getDispatcherInfo(dto.nick)).data;

    if (!drStats._max.authorName || drStats._count._all == 0)
      return {
        content: 'Brak informacji na temat tego dyżurnego!',
        ephemeral: true,
      };

    const embed = new EmbedBuilder()
      .setTitle(`Statystyki dyżurnego ${drStats._max.authorName}`)
      .setColor('Random')
      .setDescription('Statystyki ruchu dyżurnego')
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
      ])
      .setFooter({
        text: `Historia dyżurów dostępna pod /drhistory ${drStats._max.authorName}`,
      });
    return {
      embeds: [embed],
    };
  }
}
