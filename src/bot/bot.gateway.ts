import { Global, Injectable, Logger, UseGuards } from '@nestjs/common';
import { InjectDiscordClient, On, Once } from '@discord-nestjs/core';
import {
  ActivityType,
  ChatInputCommandInteraction,
  Client,
  Interaction,
  InteractionType,
  Message,
  Presence,
} from 'discord.js';
import { PrefixCommandHandler } from './handlers/PrefixCommandHandler';
import { PrismaService } from '../prisma/prisma.service';
import { AdministratorCommandGuard, PrefixCommandGuard } from './guards/command.guard';
import { collectEmojis } from './utils/emojiUtils';
import { Cron, CronExpression } from '@nestjs/schedule';
import { KofolaGiveway } from './serverEvents/giveway-event.service';
import { isDevelopment } from './utils/envUtils';
import { DailyStatsOverview } from './serverEvents/daily-stats-event.service';
import { UserVerificationService } from './setups/verification';
import { ApiService } from '../api/api.service';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger('DiscordBot');

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    readonly prisma: PrismaService,
    private readonly verificationService: UserVerificationService,
    private readonly giveway: KofolaGiveway,
    private readonly dailyOverview: DailyStatsOverview,
    private readonly prefixCmdHandler: PrefixCommandHandler,
    private readonly apiService: ApiService,
  ) {}

  private logSlashCommand(i: ChatInputCommandInteraction) {
    this.logger.log(
      `${i.user.username} (${i.user.id}): /${i.commandName} ${i.options.data
        .map((param) => `${param.name}: ${param.value}`)
        .join(' ')}`,
    );
  }

  @Once('ready')
  onReady() {
    this.logger.log('Bot was started!');

    this.client.user!.setPresence({
      activities: [
        {
          name: 'Train Driver 2',
          state: '',
          type: ActivityType.Custom,
        },
      ],
      status: 'online',
    });

    collectEmojis(this.client);

    // Weryfikacja userów
    this.verificationService.setupVerificationChannel();

    // Pobieranie danych online
    this.getActiveDataCron();
  }

  @On('interactionCreate')
  async onInteraction(i: Interaction) {
    if (i.type == InteractionType.ApplicationCommand) this.logSlashCommand(i as ChatInputCommandInteraction);

    if (i.type == InteractionType.MessageComponent) {
      // Verification button
      if (i.customId && /^stacjobot_verify/.test(i.customId)) {
        const verifyResult = await this.verificationService.verifyUser(i);

        if (verifyResult) i.reply({ content: 'Zostałeś zweryfikowany!', ephemeral: true });
        else i.reply({ content: 'Jesteś już zweryfikowany!', ephemeral: true });
      }
    }
  }

  @On('messageCreate')
  @UseGuards(PrefixCommandGuard)
  async onPrefixCommand(message: Message) {
    this.prefixCmdHandler.handleCommands(message);
  }

  @On('messageCreate')
  @UseGuards(AdministratorCommandGuard)
  async onMessage(message: Message) {
    if (message.content == '!test' && isDevelopment()) {
      // this.giveway.runGiveway();
      // this.dailyOverview.runEvent();
      // this.topListEvent.updateTopList();
    }
  }

  @On('presenceUpdate')
  async onPresenceUpdate(oldPresence: Presence, newPresence: Presence) {
    const modes = ['Tryb dyżurnego', 'Tryb maszynisty'];

    // check for activities from TD2 RPC
    const newActivity = newPresence?.activities.find((a) => a.applicationId == '1080201895139885066');
    const oldActivity = oldPresence?.activities.find((a) => a.applicationId == '1080201895139885066');

    // check if there's new activity instance and there's no old one - add role
    if (newActivity && !oldActivity) {
      if (newPresence.member && newPresence.member.roles.cache.find((r) => r.name == 'Wykluczony')) {
        this.logger.warn(`Użytkownik wykluczony z Presence: ${newPresence.userId}`);
        return;
      }

      const mode = newActivity.assets?.smallText;

      // check if mode is correct, otherwise abort
      if (!mode || !modes.includes(mode)) return;
      if (!newPresence.guild) return;

      await newPresence.guild.roles.fetch();

      // match mode to role name
      const td2Role = newPresence.guild.roles.cache.find(
        (r) => r.name === (mode == 'Tryb maszynisty' ? 'Maszynista Online' : 'Dyżurny Online'),
      );

      try {
        if (td2Role) await newPresence.member?.roles.add(td2Role);
        else this.logger.warn(`presenceUpdate: no TD2 Role to assign! (${mode})!`);
      } catch (error) {
        this.logger.error('Error occurred when assigning role to user (presenceUpdate)', error);
      }
    }

    // check if there's no new activity - remove role
    if (!newActivity && oldActivity) {
      const mode = oldActivity.assets?.smallText;

      // check if mode is correct, otherwise abort
      if (!mode || !modes.includes(mode)) return;
      if (!oldPresence.guild) return;

      await oldPresence.guild.roles.fetch();

      // match mode to role name
      const td2Role = oldPresence.guild.roles.cache.find(
        (r) => r.name === (mode == 'Tryb maszynisty' ? 'Maszynista Online' : 'Dyżurny Online'),
      );

      try {
        if (td2Role) await oldPresence.member?.roles.remove(td2Role);
        else this.logger.warn(`presenceUpdate: no TD2 Role to remove! (${mode})!`);
      } catch (error) {
        this.logger.error('Error occurred when removing role from user (presenceUpdate)', error);
      }
    }
  }

  // 21:37 - kofola event
  @Cron('37 21 * * *', { timeZone: 'Europe/Warsaw' })
  async scheduleGiveway() {
    this.giveway.runGiveway();
  }

  // 00:00:05 - stats event
  @Cron('05 00 00 * * *', { timeZone: 'Europe/Warsaw' })
  async scheduleStatsOverview() {
    this.dailyOverview.runEvent();
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async getActiveDataCron() {
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
