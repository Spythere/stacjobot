import { EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { DrTopChoices, DrTopDto } from '../dto/drtop.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
import { SlashCommandPipe } from '@discord-nestjs/common';

@Command({
  name: 'drtop',
  description: 'Top lista dyżurnych ruchu',
})
export class DrTopCmd {
  constructor(private prisma: PrismaService) {}

  @Handler()
  async onCommand(
    @InteractionEvent(SlashCommandPipe) dto: DrTopDto,
  ): Promise<InteractionReplyOptions> {
    const embed = new EmbedBuilder().setColor('Random');

    switch (dto.type) {
      case DrTopChoices['Ocena dyżurnego']:
        embed.setTitle('Top lista dyżurnych - suma ocen');
        embed.setFooter({
          text: 'Szczegółowe statystyki o ocenach dyżurnych są zbierane od 25 lutego 2023r.',
        });

        embed.addFields(
          (await this.getTopLikeCount()).map((top, i) => {
            return {
              name: `${i + 1}. ${top.dispatcherName}`,
              value: `${top.sumRate}`,
              inline: true,
            };
          }),
        );

        break;

      case DrTopChoices['Liczba wystawionych RJ']:
        embed.setTitle('Top lista dyżurnych - wystawione rozkłady jazdy');
        embed.setFooter({
          text: 'Szczegółowe statystyki o autorach RJ są zbierane od 1 lutego 2022r.',
        });

        embed.addFields(
          (await this.getTopTimetableCount()).map((top, i) => {
            return {
              name: `${i + 1}. ${top.authorName}`,
              value: top._count.timetableId.toString(),
              inline: true,
            };
          }),
        );

        break;

      case DrTopChoices['Liczba wypełnionych dyżurów']:
        embed.setTitle('Top lista dyżurnych - liczba dyżurów');
        embed.setFooter({
          text: 'Szczegółowe statystyki o liczbie dyżurów są zbierane od 1 lutego 2022r.',
        });

        embed.addFields(
          (await this.getTopServiceCount()).map((top, i) => {
            return {
              name: `${i + 1}. ${top.dispatcherName}`,
              value: top._count.id.toString(),
              inline: true,
            };
          }),
        );

        break;

      case DrTopChoices['Najdłuższy wystawiony RJ']:
        embed.setTitle('Top lista dyżurnych - najdłuższy rozkład jazdy');
        embed.setFooter({
          text: 'Szczegółowe statystyki o rozkładach jazdy są zbierane od 1 lutego 2022r.',
        });

        embed.addFields(
          (await this.getTopLongestTimetables()).map((top, i) => {
            return {
              name: `${i + 1}. ${top.routeDistance}km | #${top.timetableId}`,
              value: top.authorName,
              inline: true,
            };
          }),
        );

        break;
      default:
        break;
    }

    return { embeds: [embed] };
  }

  // Wystawione rozkłady jazdy
  private async getTopTimetableCount() {
    return this.prisma.timetables.groupBy({
      by: ['authorName'],
      where: {
        authorName: { not: { equals: '' } },
        hidden: false,
      },
      _count: {
        timetableId: true,
      },
      orderBy: {
        _count: {
          timetableId: 'desc',
        },
      },
      take: 24,
    });
  }

  // Liczba dyżurów
  private async getTopServiceCount() {
    return this.prisma.dispatchers.groupBy({
      by: ['dispatcherName'],
      where: {
        hidden: false,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 24,
    });
  }

  // Najdłuższy wystawiony RJ
  private async getTopLongestTimetables() {
    const res = this.prisma.timetables.findMany({
      where: {
        authorName: { not: { equals: '' } },
        hidden: false,
      },
      orderBy: {
        routeDistance: 'desc',
      },
      take: 24,
    });

    return res;
  }

  // Like count
  private async getTopLikeCount() {
    const results: {
      dispatcherName: string;
      sumRate: number;
    }[] = await this.prisma
      .$queryRaw`select s."dispatcherName",SUM(s."maxRate") as "sumRate" from (select "dispatcherName",CONCAT("dispatcherName",'@',"stationName") as "sessionID", MAX("dispatcherRate") as "maxRate" from dispatchers where "dispatcherRate">0 and "hidden"=false group by "sessionID", "dispatcherName") as s group by "dispatcherName" order by "sumRate" desc, s."dispatcherName" asc limit 24;`;

    return results;
  }
}
