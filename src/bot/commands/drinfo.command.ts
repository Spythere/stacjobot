import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UsePipes,
} from '@discord-nestjs/core';
import { TransformPipe } from '@discord-nestjs/common';

import { Injectable } from '@nestjs/common';
import { EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { DrNickDto } from '../dto/drnick.dto';
import { ApiService } from '../../api/api.service';
import { TimetableData } from '../../api/models/timetable.interface';

@Injectable()
@Command({
  name: 'drinfo',
  description: 'Statystyki dyżurnego',
})
@UsePipes(TransformPipe)
export class DrInfoCmd implements DiscordTransformedCommand<DrNickDto> {
  constructor(private readonly apiService: ApiService) {}

  private timetablesFieldValue(timetables: TimetableData[]) {
    return timetables
      .map(
        (tt) =>
          `${tt.driverName} | ${tt.trainCategoryCode} ${tt.trainNo} (${
            tt.routeDistance
          }km) \n ID: #${tt.id} \n ${tt.route.replace('|', ' -> ')}`,
      )
      .join('\n\n');
  }

  async handler(
    @Payload() dto: DrNickDto,
    { interaction }: TransformedCommandExecutionContext,
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
          value: this.timetablesFieldValue(drTimetables),
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
