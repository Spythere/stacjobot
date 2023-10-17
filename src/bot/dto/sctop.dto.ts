import { Choice, Param } from '@discord-nestjs/core';

export enum ScTopChoices {
  'Liczba wypełnionych dyżurów' = 'SERVICE_COUNT',
  'Ocena dyżurnego' = 'LIKE_COUNT',
}

export class ScTopDto {
  @Param({
    name: 'sceneria',
    description: 'Nazwa scenerii',
    required: true,
  })
  name: string;

  @Param({
    name: 'typ',
    description: 'Rodzaj top listy',
    required: true,
  })
  @Choice(ScTopChoices)
  type: ScTopChoices;
}
