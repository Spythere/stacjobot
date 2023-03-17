import { EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
import { SlashCommandPipe } from '@discord-nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SceneryNameDto } from '../dto/sclikes.dto';

@Command({
  name: 'sclikes',
  description: 'Top lista ocen dyżurnych na scenerii',
})
export class ScLikesCmd {
  constructor(private readonly prisma: PrismaService) {}

  @Handler()
  async onCommand(
    @InteractionEvent(SlashCommandPipe) dto: SceneryNameDto,
  ): Promise<InteractionReplyOptions> {
    const results: {
      dispatcherName: string;
      sessionID: string;
      maxRate: number;
    }[] = await this.prisma
      .$queryRaw`select "dispatcherName", CONCAT("dispatcherName",'@',"stationName") as "sessionID", MAX("dispatcherRate") as "maxRate" from dispatchers where UPPER("stationName")=UPPER(${dto.sceneryName}) and "dispatcherRate">0 group by "sessionID", "dispatcherName" order by "maxRate" desc, "dispatcherName" asc limit 24;`;

    if (results.length == 0)
      return {
        content: 'Brak informacji o ocenach dyżurnych na tej scenerii!',
        ephemeral: true,
      };

    console.log(results);
    const sceneryName = results[0].sessionID.split('@')[1];

    const embed = new EmbedBuilder()
      .setTitle(`Top lista ocen dyżurnych na scenerii ${sceneryName}`)
      .setColor('Random')
      .setDescription(`Liczba wyświetlanych pozycji: ${results.length}`)
      .addFields([
        ...results.map((res) => ({
          name: res.dispatcherName,
          value: res.maxRate.toString(),
          inline: true,
        })),
      ])
      .setFooter({
        text: `Statystyki o ocenach są zbierane od 25 lutego 2023r.`,
      });

    return {
      embeds: [embed],
    };
  }
}
