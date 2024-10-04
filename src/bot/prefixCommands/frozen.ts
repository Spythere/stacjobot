import { Message } from 'discord.js';
import { readFile } from 'fs/promises';
import path from 'path';
import { cwd } from 'process';

// Złote teksty Frozena
export async function handleFrozenCommand(message: Message) {
  const quotesTxt = await readFile(path.join(cwd(), 'src', 'data', 'frozenQuotes.json'), 'utf-8');

  try {
    const quotesJSON: string[] = JSON.parse(quotesTxt);
    const randIndex = Math.floor(Math.random() * quotesJSON.length);

    message.reply(`Oto cytat Frozena dla ciebie:\n\n> ${quotesJSON[randIndex]}`);
  } catch (error) {
    console.error('Ups! Coś poszło nie tak podczas przetwarzania komendy');
  }
}
