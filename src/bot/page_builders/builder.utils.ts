import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { BuilderId } from './builder.interfaces';

export class PageBuilderUtils {
  static generateButtons(builderId: BuilderId, value: string, currentPage: number, pageCount: number) {
    const prevPage = currentPage == 1 ? 1 : currentPage - 1;
    const nextPage = currentPage + 1;
    const lastPage = Math.ceil(pageCount / 10);

    const buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`${builderId}-${value}-1-first`) // schistory-Blaszki-1-first
        .setLabel('1.')
        .setStyle(ButtonStyle.Success)
        .setDisabled(currentPage == 1),
      new ButtonBuilder()
        .setCustomId(`${builderId}-${value}-${prevPage}`) // schistory-Blaszki-2
        .setLabel('<')
        .setStyle(ButtonStyle.Success)
        .setDisabled(currentPage == 1),
      new ButtonBuilder()
        .setCustomId('page-number') // 2
        .setLabel(currentPage.toString())
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`${builderId}-${value}-${nextPage}`) // schistory-Blaszki-3
        .setLabel('>')
        .setStyle(ButtonStyle.Success)
        .setDisabled(currentPage == lastPage),
      new ButtonBuilder()
        .setCustomId(`${builderId}-${value}-${lastPage}-last`) // schistory-Blaszki-4-last
        .setLabel(`${lastPage}.`)
        .setStyle(ButtonStyle.Success)
        .setDisabled(currentPage == lastPage),
    );
    return buttonsRow;
  }

  static generateBasicEmbed(currentPage: number, totalDataCount: number, title: string) {
    const indexFrom = (currentPage - 1) * 10 + 1;
    const indexTo = indexFrom + 9 < totalDataCount ? indexFrom + 9 : totalDataCount;

    const embed = new EmbedBuilder();

    embed.setTitle(title);
    embed.setDescription(`Wyświetlane pozycje w bazie: ${indexFrom}-${indexTo} z ${totalDataCount}`);
    embed.setColor('Random');

    return embed;
  }
}
