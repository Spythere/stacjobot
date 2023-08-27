import { Message } from 'discord.js';
import { getEmojiByName } from '../constants/customEmojiIds';
import { isDevelopment } from '../utils/envUtils';

const MAX_TIMEOUT_MINUTES = 1440,
  MIN_TIMEOUT_MINUTES = 120;

function getFormattedTimeout(minutesTotal: number) {
  const days = ~~(minutesTotal / 1440);
  const hours = ~~((minutesTotal / 60) % 24);
  const minutes = minutesTotal % 60;

  return `${days > 0 ? days + 'd, ' : ''}${hours + 'h i '}${minutes}m`;
}

export async function randomMuteUser(message: Message) {
  const randMinutesTotal = ~~(
    Math.random() * (MAX_TIMEOUT_MINUTES - MIN_TIMEOUT_MINUTES) +
    MIN_TIMEOUT_MINUTES
  );

  try {
    if (!isDevelopment())
      await message.member.timeout(randMinutesTotal * 60 * 1000);

    const rewidentEmoji = getEmojiByName(message, 'rewident');
    const formattedTimeout = getFormattedTimeout(randMinutesTotal);

    message.react(rewidentEmoji);

    // console.debug(`time: ${randMinutesTotal}; formatted: ${formattedTimeout}`);

    message.reply(
      `Gratulacje, <@${message.member.id}>! Dostałeś ${formattedTimeout} przerwy! ${rewidentEmoji}`,
    );
  } catch (error) {
    const bagietyEmoji = getEmojiByName(message, 'bagiety');

    message.reply(
      `Niestety, obecny reżim nie pozwala na mutowanie oficjeli na wysokich stanowiskach! ${bagietyEmoji}`,
    );
  }
}
