import { EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { ScTopChoices, ScTopDto } from '../dto/sctop.dto';
import { SlashCommandPipe } from '@discord-nestjs/common';
import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';

interface ITopDispatcherCount {
  dispatcherName: string;
  count: number;
}

@Command({
  name: 'sctop',
  description: 'Top lista scenerii',
})
export class ScTopCmd {
  constructor(private prisma: PrismaService) {}

  @Handler()
  async onCommand(
    @InteractionEvent(SlashCommandPipe) dto: ScTopDto,
  ): Promise<InteractionReplyOptions> {
    switch (dto.type) {
      case ScTopChoices['Liczba wypełnionych dyżurów']:
        return this.onServiceCountChoice(dto.name);

      case ScTopChoices['Ocena dyżurnego']:
        return this.onLikeCountChoice(dto.name);
    }
  }

  private async onServiceCountChoice(sceneryName: string) {
    const topQueryResult: ITopDispatcherCount[] = await this.prisma
      .$queryRaw`select "dispatcherName",count(*) FROM dispatchers WHERE UPPER("stationName")=UPPER(${sceneryName}) AND "hidden"=false GROUP BY "dispatcherName" ORDER BY count DESC LIMIT 24`;

    if (topQueryResult.length == 0)
      return {
        content: 'Nie znaleziono wyników dla scenerii o podanej nazwie!',
      };

    const embed = new EmbedBuilder();
    embed.setTitle(
      `TOP LISTA DYŻURÓW NA SCENERII ${sceneryName.toUpperCase()}`,
    );
    embed.setColor('Random');

    embed.addFields(
      topQueryResult.map((top, i) => ({
        name: `${i + 1}. ${top.dispatcherName}`,
        value: `${top.count}`,
        inline: true,
      })),
    );

    return {
      embeds: [embed],
    };
  }

  private async onLikeCountChoice(sceneryName: string) {
    const topQueryResult: ITopDispatcherCount[] = await this.prisma
      .$queryRaw`select s."dispatcherName",SUM(s."maxRate") as "count" from (select "dispatcherName",CONCAT("dispatcherName",'@',"stationHash") as "sessionID", MAX("dispatcherRate") as "maxRate" from dispatchers where "dispatcherRate">0 and "hidden"=false and UPPER("stationName")=UPPER(${sceneryName}) group by "sessionID", "dispatcherName") as s group by "dispatcherName" order by "count" desc, s."dispatcherName" asc limit 24;`;

    if (topQueryResult.length == 0)
      return {
        content: 'Nie znaleziono wyników dla scenerii o podanej nazwie!',
      };

    const embed = new EmbedBuilder();
    embed.setTitle(`TOP LISTA OCEN NA SCENERII ${sceneryName.toUpperCase()}`);
    embed.setColor('Random');

    embed.addFields(
      topQueryResult.map((top, i) => ({
        name: `${i + 1}. ${top.dispatcherName}`,
        value: `${top.count}`,
        inline: true,
      })),
    );

    return {
      embeds: [embed],
    };
  }
}
