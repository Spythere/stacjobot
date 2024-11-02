import { Message } from 'discord.js';
import { randomRangeInteger } from '../../utils/randomUtils';

const MAX_TIMEOUT_HOURS = 12,
  MIN_TIMEOUT_HOURS = 2;

export class DajBanaPrefixCmd {
  async runCommand(message: Message) {
    const randHours = randomRangeInteger(MAX_TIMEOUT_HOURS, MIN_TIMEOUT_HOURS);

    const date = new Date();
    date.setHours(date.getHours() + randHours);

    message.reply(
      `Gratulacje, <@${message.member!.id}>! Zostaniesz permamentnie zbanowany <t:${~~(date.getTime() / 1000)}:R>`,
    );
  }
}
