import { Injectable } from '@nestjs/common';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import { ApiService } from '../../api/api.service';
import { TimetableData } from '../../api/models/timetable.interface';

@Injectable()
export class TimetablePageBuilder {
  constructor(private apiService: ApiService) {}

  async generateTimetablesPage(nick: string, currentPage: number) {
    const timeStart = Date.now();

    const timetables = await this.apiService.getTimetables({
      driverName: nick,
      countFrom: (currentPage - 1) * 10,
      countLimit: 10,
    });

    if (timetables.data.length == 0)
      return {
        content: 'Ten użytkownik nie posiada zapisanych rozkładów jazdy!',
        ephemeral: true,
      };

    const driverInfo = await (await this.apiService.getDriverInfo(nick)).data;

    const buttonsRow = this.generateTimetablesButtons(
      nick,
      currentPage,
      driverInfo._count._all,
    );
    const sceneryEmbed = this.generateTimetablesEmbed(
      timetables.data,
      currentPage,
      driverInfo._sum.routeDistance,
      driverInfo._count._all,
      Date.now() - timeStart,
    );

    return {
      embeds: [sceneryEmbed],
      components: [buttonsRow],
      ephemeral: true,
    };
  }

  private generateTimetablesEmbed(
    timetables: TimetableData[],
    currentPage: number,
    distanceSum: number,
    docsCount: number,
    queryTimeMs: number,
  ) {
    const indexFrom = (currentPage - 1) * 10 + 1;
    const indexTo = indexFrom + 9 < docsCount ? indexFrom + 9 : docsCount;

    const embed = new EmbedBuilder();

    embed.setTitle(`Rozkłady jazdy maszynisty ${timetables[0].driverName}`);
    embed.setColor('Random');
    embed.setDescription(
      `Wyświetlane pozycje w bazie: ${indexFrom}-${indexTo} z ${docsCount}`,
    );

    embed.addFields(
      {
        name: 'Kilometraż ze wszystkich zapisanych rozkładów jazdy',
        value: distanceSum.toFixed(2) + 'km',
      },
      ...timetables.map((timetable) => {
        return {
          name: `${timetable.trainCategoryCode} ${
            timetable.trainNo
          } | ${timetable.route.replace('|', ' > ')}`,
          value: `#ID: ${timetable.id}
Kilometry: ${timetable.currentDistance} / ${timetable.routeDistance}km
Stacje: ${timetable.confirmedStopsCount} / ${timetable.allStopsCount}`,
        };
      }),
    );

    embed.setFooter({
      text: `Szczegółowe informacje o rozkładzie: ?rjId <#ID> - wygenerowano w ${queryTimeMs}ms`,
    });
    return embed;
  }

  private generateTimetablesButtons(
    nickname: string,
    currentPage: number,
    docsCount: number,
  ) {
    const prevPage = currentPage == 1 ? 1 : currentPage - 1;
    const nextPage = currentPage + 1;
    const lastPage = Math.ceil(docsCount / 10);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`btn-timetableFirst-${nickname}-1`)
        .setLabel('1.')
        .setStyle(ButtonStyle.Success)
        .setDisabled(currentPage == 1),

      new ButtonBuilder()
        .setCustomId(`btn-timetable-${nickname}-${prevPage}`)
        .setLabel('<')
        .setStyle(ButtonStyle.Success)
        .setDisabled(currentPage == 1),

      new ButtonBuilder()
        .setCustomId('page-number')
        .setLabel(currentPage.toString())
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),

      new ButtonBuilder()
        .setCustomId(`btn-timetable-${nickname}-${nextPage}`)
        .setLabel('>')
        .setStyle(ButtonStyle.Success)
        .setDisabled(currentPage == lastPage),

      new ButtonBuilder()
        .setCustomId(`btn-timetableLast-${nickname}-${lastPage}`)
        .setLabel(`${lastPage}.`)
        .setStyle(ButtonStyle.Success)
        .setDisabled(currentPage == lastPage),
    );

    return row;
  }
}
