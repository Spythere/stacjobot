import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhookClient } from 'discord.js';
import { ApiService } from '../../api/api.service';
import { IDailyStats } from '../../api/interfaces/_index';
import DailyStatsCanvas from './utils/dailyStatsCanvas';
import { DailyStatsScope } from '../../api/dtos/dailyStats.dto';
import { Cron } from '@nestjs/schedule';
import { Once } from '@discord-nestjs/core';

@Injectable()
export class DailyStatsEvent {
  private webhookClient: WebhookClient;
  private dailyStatsCanvas: DailyStatsCanvas;

  constructor(
    private readonly apiService: ApiService,
    private readonly config: ConfigService,
  ) {
    this.webhookClient = new WebhookClient({
      url: this.config.get<string>('OVERVIEW_WEBHOOK_URL')!,
    });

    this.dailyStatsCanvas = new DailyStatsCanvas();
  }

  private logger = new Logger('DailyStatsOverview');

  @Once('ready')
  onReady() {
    this.dailyStatsCanvas.setup();
    this.runEvent(); // test
  }

  // 00:00:05 - stats event
  @Cron('05 00 00 * * *', { timeZone: 'Europe/Warsaw' })
  async statsOverviewCron() {
    this.runEvent();
  }

  async runEvent() {
    this.logger.log('Przygotowywanie danych...');

    try {
      const dailyData = await this.fetchLastDayStats();
      this.dailyStatsCanvas.getDailyStatsData(dailyData);

      await this.sendWebhook();

      this.logger.log('Pomyślnie przesłano dane!');
    } catch (error) {
      this.logger.error('Ups! Coś poszło nie tak podczas przetwarzania DailyStatsOverview: ', error);
    }
  }

  private async fetchLastDayStats(): Promise<IDailyStats> {
    try {
      return (
        await this.apiService.getDailyTimetableStats({
          scope: DailyStatsScope.LAST_24_HOURS,
        })
      ).data;
    } catch (error) {
      throw error;
    }
  }

  private async sendWebhook() {
    if (!this.dailyStatsCanvas) {
      this.logger.warn('Webhook nie został wysłany z powodu źle zainicjowanej instancji canvas!');
      return;
    }

    const canvasSVG = this.dailyStatsCanvas.prepareCanvasJPEG();

    // const todayString = format(new Date(), 'do MMMM Yo', { locale: pl });

    const contentLines = [
      `# :clock12: _I oto nastała północ..._`,
      `## Podsumowanie statystyk TD2 z ostatnich 24 godzin:`,
    ];

    if (!canvasSVG) {
      this.logger.warn('Webhook nie został wysłany z powodu źle wygenerowanego buforu!');
      return;
    }

    try {
      await this.webhookClient.send({
        content: contentLines.join('\n'),
        files: [
          {
            attachment: canvasSVG,
            name: `statystyki.jpg`,
          },
        ],
      });
    } catch (error) {
      throw error;
    }
  }
}
