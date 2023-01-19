import { dispatchers } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SceneryPageBuilder {
  constructor(private prisma: PrismaService) {}

  async generateSceneryPage(stationName: string, currentPage: number) {
    const timeStart = Date.now();

    const historyPageDocs = await this.fetchHistoryPageDocs(
      stationName,
      currentPage,
    );

    if (historyPageDocs.length == 0)
      return {
        content: 'Brak historii dyżurów dla tej scenerii!',
        ephemeral: true,
      };

    const totalDocsCount = await this.getTotalDocs(stationName);

    const buttonsRow = this.generateSceneryButtons(
      stationName,
      currentPage,
      totalDocsCount,
    );
    const sceneryEmbed = this.generateSceneryEmbed(
      historyPageDocs,
      currentPage,
      totalDocsCount,
      Date.now() - timeStart,
    );

    return {
      embeds: [sceneryEmbed],
      components: [buttonsRow],
      ephemeral: true,
    };
  }

  private async fetchHistoryPageDocs(stationName: string, currentPage: number) {
    const res = this.prisma.dispatchers.findMany({
      where: {
        stationName: {
          equals: stationName,
          mode: 'insensitive',
        },
        timestampTo: { gt: 0 },
      },
      orderBy: {
        timestampFrom: 'desc',
      },
      skip: (currentPage - 1) * 10,
      take: 10,
    });

    return res;
  }

  private async getTotalDocs(stationName: string) {
    const aggregated = await this.prisma.dispatchers.aggregate({
      where: {
        stationName: {
          equals: stationName,
          mode: 'insensitive',
        },
        timestampTo: { gt: 0 },
      },
      _count: {
        _all: true,
      },
    });

    return aggregated._count._all || 0;
  }

  private generateSceneryButtons(
    stationName: string,
    currentPage: number,
    totalDocsCount: number,
  ) {
    const prevPage = currentPage == 1 ? 1 : currentPage - 1;
    const nextPage = currentPage + 1;
    const lastPage = Math.ceil(totalDocsCount / 10);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`btn-sceneryFirst-${stationName}-1`)
        .setLabel('1.')
        .setStyle(ButtonStyle.Success)
        .setDisabled(currentPage == 1),

      new ButtonBuilder()
        .setCustomId(`btn-scenery-${stationName}-${prevPage}`)
        .setLabel('<')
        .setStyle(ButtonStyle.Success)
        .setDisabled(currentPage == 1),

      new ButtonBuilder()
        .setCustomId('page-number')
        .setLabel(currentPage.toString())
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),

      new ButtonBuilder()
        .setCustomId(`btn-scenery-${stationName}-${nextPage}`)
        .setLabel('>')
        .setStyle(ButtonStyle.Success)
        .setDisabled(currentPage == lastPage),

      new ButtonBuilder()
        .setCustomId(`btn-sceneryLast-${stationName}-${lastPage}`)
        .setLabel(`${lastPage}.`)
        .setStyle(ButtonStyle.Success)
        .setDisabled(currentPage == lastPage),
    );

    return row;
  }

  private generateSceneryEmbed(
    historyDocs: dispatchers[],
    currentPage: number,
    totalDocsCount: number,
    queryTimeMs: number,
  ) {
    const indexFrom = (currentPage - 1) * 10 + 1;
    const indexTo =
      indexFrom + 9 < totalDocsCount ? indexFrom + 9 : totalDocsCount;

    const embed = new EmbedBuilder();
    embed.setTitle(
      `Historia dyżurnych na scenerii ${historyDocs[0].stationName}`,
    );
    embed.setDescription(
      `Wyświetlane pozycje w bazie: ${indexFrom}-${indexTo} z ${totalDocsCount}`,
    );

    embed.setColor('Random');

    embed.addFields(
      historyDocs.map((doc) => ({
        name: `${doc.dispatcherName}`,
        value: `<t:${Math.round(
          doc.timestampFrom.valueOf() / 1000,
        )}:D> <t:${Math.round(
          doc.timestampFrom.valueOf() / 1000,
        )}:t>-<t:${Math.round(doc.timestampTo.valueOf() / 1000)}:t>`,
      })),
    );

    embed.setFooter({ text: `Pobrano w ${queryTimeMs}ms` });
    return embed;
  }
}
