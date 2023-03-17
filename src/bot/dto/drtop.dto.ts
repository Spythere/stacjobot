import { Choice, Param } from '@discord-nestjs/core';

enum TopChoices {
  'Liczba wystawionych RJ' = 'TIMETABLE_COUNT',
  'Najdłuższy wystawiony RJ' = 'LONGEST_TIMETABLE',
  'Liczba wypełnionych dyżurów' = 'SERVICE_COUNT',
  'Ocena dyżurnego' = 'LIKE_COUNT',
}

export class DrTopDto {
  @Param({
    name: 'typ',
    description: 'Rodzaj top listy',
    required: true,
  })
  @Choice(TopChoices)
  type: string;
}
