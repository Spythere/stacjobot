import { Injectable, Logger } from '@nestjs/common';
import { InjectDiscordClient, Once } from '@discord-nestjs/core';
import { Client } from 'discord.js';
import { collectEmojis } from './utils/emojiUtils';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger('DiscordBot');

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) {}

  @Once('ready')
  onReady() {
    this.logger.log('Bot was started!');

    collectEmojis(this.client);
  }

  // @On('messageCreate')
  // @UseGuards(AdministratorCommandGuard)
  // async onMessage(message: Message) {
  //   if (message.content == '!test' && isDevelopment()) {
  //     // this.giveway.runGiveway();
  //     // this.dailyOverview.runEvent();
  //     // this.topListEvent.updateTopList();
  //   }
  // }
}
