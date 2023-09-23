import { Choice, Param } from '@discord-nestjs/core';

export enum TopChoices {
  'Dzisiaj' = 'TODAY',
  'Ten tydzień' = 'WEEK',
}

export class TD2StatsDto {
  @Param({
    name: 'typ',
    description: 'Typ statystyk',
    required: true,
  })
  @Choice(TopChoices)
  type: TopChoices;
}
