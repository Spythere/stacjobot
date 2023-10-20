import { dispatchers } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { ApiService } from '../../api/api.service';
import { IDispatcher } from '../../api/interfaces/dispatcher.interface';
import { PageBuilderUtils } from './builder.utils';

@Injectable()
export class SceneryPageBuilder {
  constructor(private apiService: ApiService) {}

  async generatePage(stationName: string, currentPage: number) {
    const timeStart = Date.now();

    const { dispatchers, count } = (
      await this.fetchData(stationName, currentPage)
    ).data;

    if (dispatchers.length == 0 || count == 0)
      return {
        content: 'Brak historii dyżurów dla tej scenerii!',
        ephemeral: true,
      };

    return {
      embeds: [
        this.generateEmbed(
          dispatchers,
          currentPage,
          count,
          Date.now() - timeStart,
        ),
      ],
      components: [
        PageBuilderUtils.generateButtons(
          'schistory',
          stationName,
          currentPage,
          count,
        ),
      ],
      ephemeral: true,
    };
  }

  private generateEmbed(
    historyDocs: IDispatcher[],
    currentPage: number,
    totalDocsCount: number,
    queryTimeMs: number,
  ) {
    const embed = PageBuilderUtils.generateBasicEmbed(
      currentPage,
      totalDocsCount,
      `Historia dyżurnych na scenerii ${historyDocs[0].stationName}`,
    );

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

  private async fetchData(stationName: string, currentPage: number) {
    return this.apiService.getDispatchersWithCount({
      stationName,
      online: false,
      countFrom: (currentPage - 1) * 10,
      countLimit: 10,
    });
  }
}
