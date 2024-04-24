import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { InjectDiscordClient, On, Once } from '@discord-nestjs/core';
import {
  ActivityType,
  ChatInputCommandInteraction,
  Client,
  GuildMember,
  Interaction,
  InteractionType,
  Message,
  Presence,
} from 'discord.js';
import { PrefixCommandHandler } from './handlers/PrefixCommandHandler';
import { PrismaService } from '../prisma/prisma.service';
import { AdministratorCommandGuard, PrefixCommandGuard } from './guards/command.guard';
import { collectEmojis } from './utils/emojiUtils';
import { Cron } from '@nestjs/schedule';
import { KofolaGiveway } from './serverEvents/giveway-event.service';
import { isDevelopment } from './utils/envUtils';
import { DailyStatsOverview } from './serverEvents/daily-stats-event.service';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger('DiscordBot');

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    readonly prisma: PrismaService,
    private readonly giveway: KofolaGiveway,
    private readonly dailyOverview: DailyStatsOverview,
    private readonly prefixCmdHandler: PrefixCommandHandler,
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

    this.client.user!.setActivity({
      name: 'Train Driver 2',
      type: ActivityType.Playing,
      url: 'https://stacjownik-td2.web.app',
    });

    collectEmojis(this.client);
  }

  @On('interactionCreate')
  async onInteraction(i: Interaction) {
    if (i.type == InteractionType.ApplicationCommand) this.logSlashCommand(i as ChatInputCommandInteraction);
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
    }
  }

  @On('presenceUpdate')
  async onPresenceUpdate(oldPresence: Presence, newPresence: Presence) {
    const newActivity = newPresence?.activities.find((a) => a.applicationId == '1080201895139885066');
    const oldActivity = oldPresence?.activities.find((a) => a.applicationId == '1080201895139885066');

    if (oldActivity || newActivity) {
      // const mode = newActivity?.assets?.smallImage;
      // if (!mode) return;
      // await newPresence.guild.roles.fetch();
      // // match mode to role name
      // const td2Role = newPresence.guild.roles.cache.find(
      //   (r) => r.name === (mode == 'driver' ? 'Maszynista TD2' : 'Dyżurny TD2'),
      // );
      // try {
      //   if (td2Role && newActivity) await newPresence.member.roles.add(td2Role);
      //   if (td2Role && (oldActivity || !newActivity)) await oldPresence.member.roles.remove(td2Role);
      // } catch (error) {
      //   this.logger.error('Wystąpił błąd podczas aktualizowania ról (presenceUpdate)', error);
      // }
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
}
