import { InjectDiscordClient, On, Once } from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { ActivityType, Client, Presence } from 'discord.js';

export class BotPresenceService {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) {}

  private readonly logger = new Logger('Presence');

  @Once('ready')
  onReady() {
    this.setupPresence();
  }

  private setupPresence() {
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

    this.logger.log('Discord bot activity ready!');
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
}
