import { Message } from 'discord.js';
import { isDevelopment } from '../utils/envUtils';

export function getEmojiByName(message: Message, name: string) {
  return message.guild.emojis.cache.find((emoji) => emoji.name == name);
}
