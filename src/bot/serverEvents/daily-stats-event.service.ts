import axios from 'axios';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhookMessageCreateOptions } from 'discord.js';
import { ApiService } from '../../api/api.service';
import { IDailyStats } from '../../api/interfaces/_index';
import {
  formatDuration,
  formatISO,
  getUnixTime,
  intervalToDuration,
  startOfDay,
  subDays,
} from 'date-fns';
import { pl } from 'date-fns/locale';

@Injectable()
export class DailyStatsOverview {
  constructor(
    private readonly apiService: ApiService,
    private readonly config: ConfigService,
  ) {}

  private logger = new Logger('DailyStatsOverview');

  async runEvent() {
    this.logger.log('Przygotowywanie danych...');

    try {
      const dailyData = await this.fetchLastDayStats();
      const webhookMessage = this.prepareDiscordMessage(dailyData);
      await this.sendWebhook(webhookMessage);

      this.logger.log('Pomyślnie przesłano dane!');
    } catch (error) {
      this.logger.error(
        'Ups! Coś poszło nie tak podczas przetwarzania DailyStatsOverview: ',
        error,
      );
    }
  }

  private async fetchLastDayStats(): Promise<IDailyStats> {
    // const lastDayDateString = DateTime.now().minus({ day: 1 }).toISODate();
    const lastDayDateString = formatISO(subDays(new Date(), 1), {
      representation: 'date',
    });

    try {
      return (
        await this.apiService.getDailyTimetableStats({
          date: lastDayDateString,
        })
      ).data;
    } catch (error) {
      throw error;
    }
  }

  private getGlobalStatsMessage(statsData: IDailyStats) {
    return [
      `### :exclamation: WYKROCZENIA`,
      `- rozprute zwrotnice: **${statsData.globalDiff.rippedSwitches}**`,
      `- wykolejenia: **${statsData.globalDiff.derailments}**`,
      `- przejechane sygnały S1: **${statsData.globalDiff.skippedStopSignals}**`,
      `- użyte radiostopy: **${statsData.globalDiff.radioStops}**`,
      `- potrącenia: **${statsData.globalDiff.kills}**`,
    ].join('\n');
  }

  private getTopDutyMessage(statsData: IDailyStats) {
    if (statsData.longestDuties.length == 0)
      return '- najdłuższa służba: *brak danych*';

    const { duration, name, station } = statsData.longestDuties[0];

    const longestDutyTime = formatDuration(
      intervalToDuration({
        start: 0,
        end: duration,
      }),
      { locale: pl },
    );

    return `- najdłuższa służba: \`${name}\` - **${longestDutyTime}** na scenerii ${station}`;
  }

  private getTopDriverMessage(statsData: IDailyStats) {
    if (statsData.mostActiveDrivers.length == 0)
      return '- najaktywniejszy maszynista: *brak danych*';

    const { distance, name } = statsData.mostActiveDrivers[0];

    const distanceFixed = distance.toFixed(2);
    return `- najaktywniejszy maszynista: \`${name}\` - przejechany dystans **${distanceFixed}km**`;
  }

  private getTopDispatcherMessage(statsData: IDailyStats) {
    if (statsData.mostActiveDispatchers.length == 0)
      return '- najaktywniejszy dyżurny: *brak danych*';

    const { name, count } = statsData.mostActiveDispatchers[0];

    return `- najaktywniejszy dyżurny: \`${name}\` - stworzył **${count} RJ**`;
  }

  private getTopStatsMessage(statsData: IDailyStats) {
    return [
      `### :first_place: PODIUM`,
      this.getTopDutyMessage(statsData),
      this.getTopDriverMessage(statsData),
      this.getTopDispatcherMessage(statsData),
    ].join('\n');
  }

  private getOtherStatsMessage(statsData: IDailyStats) {
    return [
      `### <:kofola2:1141496846636830771> INNE`,
      `- stworzone rozkłady jazdy: **${statsData.totalTimetables}**`,
      `- łączny dystans RJ: **${statsData.distanceSum.toFixed(2)}km**`,
      `- średnia długość RJ: **${statsData.distanceAvg.toFixed(2)}km**`,
    ].join('\n');
  }

  private prepareDiscordMessage(
    statsData: IDailyStats,
  ): WebhookMessageCreateOptions {
    const dateUnix = getUnixTime(startOfDay(subDays(new Date(), 1)));

    const contentLines = [
      `# :bar_chart: STATYSTYKI TD2 Z DNIA <t:${dateUnix}:D>`,

      this.getGlobalStatsMessage(statsData),
      this.getTopStatsMessage(statsData),
      this.getOtherStatsMessage(statsData),
    ];

    return {
      content: contentLines.join('\n'),
    };
  }

  private async sendWebhook(message: WebhookMessageCreateOptions) {
    try {
      await axios.post(this.config.get('OVERVIEW_WEBHOOK_URL'), message, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      throw error.message ?? error;
    }
  }
}