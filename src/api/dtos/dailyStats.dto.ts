export enum DailyStatsScope {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  LAST_24_HOURS = '24h',
}

export class DailyStatsDto {
  scope: DailyStatsScope;
}
