import {
  ClientEvents,
  EmbedBuilder,
  InteractionReplyOptions,
} from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { ScTopDto } from '../dto/sctop.dto';
import { SlashCommandPipe } from '@discord-nestjs/common';
import {
  Command,
  Handler,
  InteractionEvent,
  EventParams,
} from '@discord-nestjs/core';

interface ITopDispatcherCount {
  dispatcherName: string;
  count: number;
}

@Command({
  name: 'sctop',
  description: 'Top lista dyżurów na scenerii',
})
export class ScTopCmd {
  constructor(private prisma: PrismaService) {}

  @Handler()
  async onCommand(
    @InteractionEvent(SlashCommandPipe) dto: ScTopDto,
    @EventParams() args: ClientEvents['interactionCreate'],
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
