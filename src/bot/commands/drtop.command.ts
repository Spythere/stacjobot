import { EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { DrTopDto } from '../dto/drtop.dto';
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
      case 'TIMETABLE_COUNT':
        embed.setTitle('Top lista dyżurnych - wystawione rozkłady jazdy');

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

      case 'SERVICE_COUNT':
        embed.setTitle('Top lista dyżurnych - liczba dyżurów');

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

      case 'LONGEST_TIMETABLE':
        embed.setTitle('Top lista dyżurnych - najdłuższy rozkład jazdy');

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

    embed.setFooter({
      text: 'Szczegółowe statystyki o dyżurnych są zbierane od 1 lutego 2022r.',
    });

    return { embeds: [embed] };
  }

  // Wystawione rozkłady jazdy
  private async getTopTimetableCount() {
    return this.prisma.timetables.groupBy({
      by: ['authorName'],
      where: {
        authorName: { not: { equals: '' } },
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
      },
      orderBy: {
        routeDistance: 'desc',
      },
      take: 24,
    });

    return res;
  }
}
