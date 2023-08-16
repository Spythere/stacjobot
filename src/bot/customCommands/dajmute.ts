import { Message } from 'discord.js';
import { getEmojiByName } from '../constants/customEmojiIds';
import { isDevelopment } from '../utils/envUtils';

const MAX_TIMEOUT_MINUTES = 360,
  MIN_TIMEOUT_MINUTES = 60;

export async function randomMuteUser(message: Message) {
  const randMinutes = ~~(
    Math.random() * (MAX_TIMEOUT_MINUTES - MIN_TIMEOUT_MINUTES) +
    MIN_TIMEOUT_MINUTES
  );

  try {
    if (!isDevelopment()) await message.member.timeout(randMinutes * 60 * 1000);

    const rewidentEmoji = getEmojiByName(message, 'rewident');

    const hours = ~~(randMinutes / 60);
    const minutes = randMinutes % 60;

    message.react(rewidentEmoji);

    message.reply(
      `Gratulacje, <@${message.member.id}>! Dostałeś ${
        hours > 0 ? hours + 'h i ' : ''
      }${minutes}m przerwy! ${rewidentEmoji}`,
    );
  } catch (error) {
    const bagietyEmoji = getEmojiByName(message, 'bagiety');

    message.reply(
      'Niestety, obecny reżim nie pozwala na mutowanie oficjeli na wysokich stanowiskach! ' +
        bagietyEmoji,
    );
  }
}
