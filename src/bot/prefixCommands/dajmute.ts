import { Message } from 'discord.js';
import { isDevelopment } from '../utils/envUtils';
import { getEmojiByName } from '../utils/emojiUtils';

const MAX_MUTE_SECONDS = 345600,
  MIN_MUTE_SECONDS = 7200;

// function getFormattedTimeout(minutesTotal: number) {
//   const days = ~~(minutesTotal / 1440);
//   const hours = ~~((minutesTotal / 60) % 24);
//   const minutes = minutesTotal % 60;

//   return `${days > 0 ? days + 'd, ' : ''}${hours + 'h i '}${minutes}m`;
// }

export async function randomMuteUser(message: Message) {
  const randMuteTime = ~~(Math.random() * (MAX_MUTE_SECONDS - MIN_MUTE_SECONDS) + MIN_MUTE_SECONDS) * 1000;
  const muteEndTimestamp = ~~((Date.now() + randMuteTime) / 1000);

  try {
    if (!isDevelopment()) await message.member.timeout(randMuteTime);

    const rewidentEmoji = getEmojiByName('rewident');
    // const formattedTimeout = getFormattedTimeout(randMinutesTotal);

    message.react(rewidentEmoji);

    message.reply(
      `Gratulacje, towarzyszu <@${message.member.id}>! Wasza zdolność wypowiadania się na tym serwerze została ograniczona.\
      \n**Termin zwrócenia pełni praw obywatelskich: <t:${muteEndTimestamp}:F>**\
      \n*Niech żyje Stacjownik!* ${rewidentEmoji}`,
    );
  } catch (error) {
    const bagietyEmoji = getEmojiByName('bagiety');

    message.reply(`Niestety, obecny reżim nie pozwala na mutowanie oficjeli na wysokich stanowiskach! ${bagietyEmoji}`);
  }
}
