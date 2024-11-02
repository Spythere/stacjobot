import { Global, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiService } from '../../api/api.service';
import { ActivityType, Client } from 'discord.js';
import { InjectDiscordClient, Once } from '@discord-nestjs/core';

@Global()
@Injectable()
export class GlobalCronsListener {
  private readonly logger = new Logger('Cron');

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly apiService: ApiService,
  ) {}

  @Once('ready')
  onReady() {
    this.activityPresenceCron(); // Run at server boot up
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async activityPresenceCron() {
    try {
      const data = (await this.apiService.getActiveData()).data;

      if (!data) return;

      const dispatchersPL1 = data.activeSceneries.filter((sc) => sc.region == 'eu' && sc.isOnline);
      const driversPL1 = data.trains.filter(
        (tr) => tr.region == 'eu' && (tr.online || tr.lastSeen >= Date.now() - 60000),
      );
      const timetablesPL1 = driversPL1.filter((tr) => tr.timetable);

      if (this.client.user) {
        this.client.user.setPresence({
          activities: [
            {
              name: 'Train Driver 2',
              state: `[PL1] DR: ${dispatchersPL1.length} | MECH: ${driversPL1.length} | RJ: ${timetablesPL1.length}`,
              type: ActivityType.Custom,
            },
          ],
          status: 'online',
        });
      }
    } catch (error) {
      this.logger.error('Błąd podczas przetwarzania danych online (getActiveDataCron)', error);
    }
  }
}
