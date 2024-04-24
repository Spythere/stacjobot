import { Client, GuildEmoji, Message } from 'discord.js';

const guildEmojis: Record<string, GuildEmoji> = {};

export function getEmojiByName(name: string) {
  const guildEmoji = Object.entries(guildEmojis).find((emojiEntry) => emojiEntry[0] == name);

  return guildEmoji?.[1];
}

export async function collectEmojis(client: Client) {
  const fetchedEmojis = client.emojis.cache;
  fetchedEmojis.forEach((emoji) => (guildEmojis[emoji.name!] = emoji));
}
