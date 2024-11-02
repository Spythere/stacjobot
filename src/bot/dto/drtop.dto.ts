import { Choice, Param } from '@discord-nestjs/core';

export enum DrTopChoices {
  'Liczba wystawionych RJ' = '1',
  'Najdłuższy wystawiony RJ' = '2',
  'Liczba wypełnionych dyżurów' = '3',
  'Ocena dyżurnego' = '4',
  'Suma długości dyżurów' = '5'
}

export class DrTopDto {
  @Param({
    name: 'typ',
    description: 'Rodzaj top listy',
    required: true,
  })
  @Choice(DrTopChoices)
  type: DrTopChoices;
} 
