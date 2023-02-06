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
import { PrismaService } from '../../prisma/prisma.service';
import { ScTopDto } from '../dto/sctop.dto';

interface ITopDispatcherCount {
  dispatcherName: string;
  count: number;
}

@Injectable()
@Command({
  name: 'sctop',
  description: 'Top lista dyżurów na scenerii',
})
@UsePipes(TransformPipe)
export class ScTopCmd implements DiscordTransformedCommand<ScTopDto> {
  constructor(private prisma: PrismaService) {}

  async handler(
    @Payload() dto: ScTopDto,
    {}: TransformedCommandExecutionContext,
  ): Promise<InteractionReplyOptions> {
    const topDispatchers: ITopDispatcherCount[] = await this.prisma
      .$queryRaw`select "dispatcherName",count(*) FROM dispatchers WHERE UPPER("stationName")=UPPER(${dto.name}) GROUP BY "dispatcherName" ORDER BY count DESC LIMIT 15`;

    if (topDispatchers.length == 0)
      return {
        content: 'Nie znaleziono wyników dla scenerii o podanej nazwie!',
      };

    const embed = new EmbedBuilder();
    embed.setTitle(`TOP LISTA DYŻURÓW NA SCENERII ${dto.name.toUpperCase()}`);
    embed.setColor('Random');

    embed.addFields(
      topDispatchers.map((top) => ({
        name: top.dispatcherName,
        value: `${top.count}`,
        inline: true,
      })),
    );

    return {
      embeds: [embed],
    };
  }
}
