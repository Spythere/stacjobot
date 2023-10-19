import { Choice, Param } from '@discord-nestjs/core';

export enum TD2StatScopes {
  'Dzisiaj' = 'day',
  'Ostatnie 12h' = '12h',
  'Ostatnie 24h' = '24h',
}

export enum TD2StatModes {
  'Maszyniści' = 'drivers=true',
  'Aktywne RJ' = 'timetables=true',
  'Dyżurni' = 'dispatchers=true',
  'Maszyniści + RJ' = 'drivers=true&timetables=true',
  'Dyżurni + RJ' = 'dispatchers=true&timetables=true',
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
