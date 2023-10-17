import { Choice, Param } from '@discord-nestjs/core';

export enum TD2StatScopes {
  'Dzisiaj' = 'TODAY',
  'Ten tydzień' = 'WEEK',
}

export enum TD2StatModes {
  'Maszyniści' = 'DRIVERS',
  'Aktywne RJ' = 'TIMETABLES',
  'Dyżurni' = 'DISPATCHERS',
  'Maszyniści + RJ' = 'DRIVERS-TIMETABLES',
  'Dyżurni + RJ' = 'DISPATCHERS-TIMETABLES',
}

export class TD2StatsDto {
  @Param({
    name: 'zakres',
    description: 'Zakres czasowy statystyk',
    required: true,
  })
  @Choice(TD2StatScopes)
  scope: TD2StatScopes;

  @Param({
    name: 'typ',
    description: 'Typ danych',
    required: true,
  })
  @Choice(TD2StatModes)
  type: TD2StatModes;
}
