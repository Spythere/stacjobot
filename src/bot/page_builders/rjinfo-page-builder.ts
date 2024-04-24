import { Injectable } from '@nestjs/common';
import { ApiService } from '../../api/api.service';
import { ITimetable } from '../../api/interfaces/timetable.interface';
import { PageBuilderUtils } from './builder.utils';

@Injectable()
export class TimetablePageBuilder {
  constructor(private apiService: ApiService) {}

  async generatePage(nick: string, currentPage: number) {
    const timeStart = Date.now();
    const { timetables, driverInfo } = await this.fetchData(nick, currentPage);

    if (timetables.data.length == 0)
      return {
        content: 'Ten użytkownik nie posiada zapisanych rozkładów jazdy!',
        ephemeral: true,
      };

    return {
      embeds: [
        this.generateEmbed(
          timetables.data,
          currentPage,
          driverInfo._sum.routeDistance ?? 0,
          driverInfo._count._all,
          Date.now() - timeStart,
        ),
      ],
      components: [PageBuilderUtils.generateButtons('rjinfo', nick, currentPage, driverInfo._count._all)],
      ephemeral: true,
    };
  }

  private async fetchData(nick: string, currentPage: number) {
    const timetables = await this.apiService.getTimetables({
      driverName: nick,
      countFrom: (currentPage - 1) * 10,
      countLimit: 10,
    });

    const driverInfo = (await this.apiService.getDriverInfo(nick)).data;

    return {
      timetables,
      driverInfo,
    };
  }

  private generateEmbed(
    timetables: ITimetable[],
    currentPage: number,
    distanceSum: number,
    totalDocsCount: number,
    queryTimeMs: number,
  ) {
    const embed = PageBuilderUtils.generateBasicEmbed(
      currentPage,
      totalDocsCount,
      `Rozkłady jazdy maszynisty ${timetables[0].driverName}`,
    );

    embed.addFields(
      {
        name: 'Kilometraż ze wszystkich zapisanych rozkładów jazdy',
        value: distanceSum.toFixed(2) + 'km',
      },
      ...timetables.map((timetable) => {
        return {
          name: `${timetable.trainCategoryCode} ${timetable.trainNo} | ${timetable.route.replace('|', ' > ')}`,
          value: `#ID: ${timetable.id}\nKilometry: ${timetable.currentDistance} / ${timetable.routeDistance}km\nStacje: ${timetable.confirmedStopsCount} / ${timetable.allStopsCount}`,
        };
      }),
    );

    embed.setFooter({
      text: `Szczegółowe informacje o rozkładzie: ?rjId <#ID> - wygenerowano w ${queryTimeMs}ms`,
    });
    return embed;
  }
}
