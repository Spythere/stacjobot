import { Injectable } from '@nestjs/common';
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, EmbedBuilder } from 'discord.js';
import { ApiService } from '../../api/api.service';
import { ITimetable } from '../../api/interfaces/timetable.interface';

@Injectable()
export class ScRjPageBuilder {
  constructor(private apiService: ApiService) {}

  async interactionController(i: ButtonInteraction<CacheType>, customId: string) {
    if (!customId.startsWith('btn-scrj')) return;

    const btnInfo = customId.split('-');
    const sceneryName = btnInfo[2];
    const pageNo = Number(btnInfo[3]);

    i.update(await this.generateSceneryPage(sceneryName, pageNo));
  }

  async generateSceneryPage(stationName: string, currentPage: number) {
    const timeStart = Date.now();

    const { timetables, count } = (await this.fetchIssuedTimetables(stationName, currentPage)).data;

    if (count == 0 || timetables.length == 0)
      return {
        content: 'Brak rozkładów wystawionych na tej scenerii!',
        ephemeral: true,
      };

    const buttonsRow = this.generateSceneryButtons(stationName, currentPage, count);

    const sceneryEmbed = this.generateSceneryEmbed(
      timetables,
      count,
      timetables[0].route.split('|')[0],
      currentPage,
      Date.now() - timeStart,
    );

    return {
      embeds: [sceneryEmbed],
      components: [buttonsRow],
      ephemeral: true,
    };
  }

  private async fetchIssuedTimetables(name: string, currentPage: number) {
    return this.apiService.getTimetablesWithCount({
      issuedFrom: name,
      countFrom: (currentPage - 1) * 10,
      countLimit: 10,
    });
  }

  private generateSceneryButtons(stationName: string, currentPage: number, totalDocsCount: number) {
    const prevPage = currentPage == 1 ? 1 : currentPage - 1;
    const nextPage = currentPage + 1;
    const lastPage = Math.ceil(totalDocsCount / 10);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`btn-scrjFirst-${stationName}-1`)
        .setLabel('1.')
        .setStyle(ButtonStyle.Success)
        .setDisabled(currentPage == 1),

      new ButtonBuilder()
        .setCustomId(`btn-scrj-${stationName}-${prevPage}`)
        .setLabel('<')
        .setStyle(ButtonStyle.Success)
        .setDisabled(currentPage == 1),

      new ButtonBuilder()
        .setCustomId('page-number')
        .setLabel(currentPage.toString())
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),

      new ButtonBuilder()
        .setCustomId(`btn-scrj-${stationName}-${nextPage}`)
        .setLabel('>')
        .setStyle(ButtonStyle.Success)
        .setDisabled(currentPage == lastPage),

      new ButtonBuilder()
        .setCustomId(`btn-scrjLast-${stationName}-${lastPage}`)
        .setLabel(`${lastPage}.`)
        .setStyle(ButtonStyle.Success)
        .setDisabled(currentPage == lastPage),
    );

    return row;
  }

  private generateSceneryEmbed(
    sceneryTimetables: ITimetable[],
    totalCount: number,
    originalSceneryName: string,
    currentPage: number,
    queryTimeMs: number,
  ) {
    const indexFrom = (currentPage - 1) * 10 + 1;
    const indexTo = indexFrom + 9 < totalCount ? indexFrom + 9 : totalCount;

    const embed = new EmbedBuilder();
    embed.setTitle(`Rozkłady jazdy wystawione na scenerii ${originalSceneryName}`);
    embed.setDescription(`Wyświetlane pozycje w bazie: ${indexFrom}-${indexTo} z ${totalCount}`);

    embed.setColor('Random');

    embed.addFields(
      sceneryTimetables.map((doc) => {
        const createdAtDate = new Date(doc.createdAt);
        const beginDate = new Date(doc.beginDate);

        const timetableStartTimestamp = ~~((beginDate < createdAtDate ? beginDate : createdAtDate).getTime() / 1000);

        const author = doc.authorName != null ? ` wystawił: ${doc.authorName}` : '';

        const route = doc.route.replace('|', ' > ');

        return {
          name: `${doc.driverName} | ${doc.trainCategoryCode} ${doc.trainNo} (${doc.routeDistance}km) [#${doc.id}]`,
          value: `<t:${timetableStartTimestamp}:R>${author}\nRelacja: ${route}`,
        };
      }),
    );

    embed.setFooter({ text: `Pobrano w ${queryTimeMs}ms` });
    return embed;
  }
}
