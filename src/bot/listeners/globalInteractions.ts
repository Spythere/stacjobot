import { On } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { Interaction, InteractionType, ChatInputCommandInteraction } from 'discord.js';

@Injectable()
export class GlobalInteractionsListener {
  private readonly logger = new Logger('SlashCommand');

  private logSlashCommand(i: ChatInputCommandInteraction) {
    this.logger.log(
      `${i.user.username} (${i.user.id}): /${i.commandName} ${i.options.data
        .map((param) => `${param.name}: ${param.value}`)
        .join(' ')}`,
    );
  }

  @On('interactionCreate')
  async onInteraction(i: Interaction) {
    if (i.type == InteractionType.ApplicationCommand) this.logSlashCommand(i as ChatInputCommandInteraction);
  }
}
