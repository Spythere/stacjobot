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
import { RjIdDto } from '../dto/rjid.dto';
import { ApiService } from '../../api/api.service';

@Injectable()
@Command({
  name: 'rjid',
  description: 'Rozkład jazdy o podanym ID',
})
@UsePipes(TransformPipe)
export class rjIdCmd implements DiscordTransformedCommand<RjIdDto> {
  constructor(private apiService: ApiService) {}

  async handler(
    @Payload() dto: RjIdDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<InteractionReplyOptions> {
    const timetables = await this.apiService.getTimetables({
      timetableId: parseInt(dto.timetableId),
    });

    if (timetables.data.length == 0)
      return {
        content: 'Nie znaleziono rozkładu jazdy o podanym ID!',
        ephemeral: true,
      };

    const resultTimetable = timetables.data[0];

    const timetableStatus = resultTimetable.fulfilled
      ? 'WYPEŁNIONY'
      : resultTimetable.terminated
      ? 'PORZUCONY'
      : 'AKTYWNY';

    const embed = new EmbedBuilder();
    embed.setTitle(`Rozkład jazdy maszynisty ${resultTimetable.driverName}`);
    embed.setColor('Random');

    if (resultTimetable.authorName)
      embed.setDescription(`Rozkład wystawił ${resultTimetable.authorName}
#ID: ${resultTimetable.id}`);

    embed.addFields({
      name: 'Relacja',
      value: resultTimetable.route.replace('|', ' - '),
      inline: true,
    });

    if (resultTimetable.driverLevel !== null)
      embed.addFields({
        name: 'Poziom maszynisty',
        value: resultTimetable.driverLevel.toString(),
        inline: true,
      });

    embed.addFields(
      {
        name: 'Trasa',
        value: resultTimetable.sceneriesString.replace(/%/g, ' > '),
      },
      {
        name: 'Długość',
        value: `${resultTimetable.routeDistance}km`,
        inline: true,
      },
      { name: 'Status', value: timetableStatus, inline: true },
      {
        name: 'Data',
        value: `<t:${Math.round(
          new Date(resultTimetable.beginDate).getTime() / 1000,
        )}:f>`,
      },
    );

    return {
      embeds: [embed],
    };
  }
}
