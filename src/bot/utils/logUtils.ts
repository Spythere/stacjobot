import { Logger } from '@nestjs/common';
import { ChatInputCommandInteraction } from 'discord.js';

export function logSlashCommand(loggerInstance: Logger, i: ChatInputCommandInteraction) {
  loggerInstance.log(
    `${i.user.username} (${i.user.id}): /${i.commandName} ${i.options.data
      .map((param) => `${param.name}: ${param.value}`)
      .join(' ')}`,
  );
}
