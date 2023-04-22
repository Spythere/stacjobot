export const getDiscordTimeFormat = (
  timestamp: number,
  format: 'date' | 'time' | 'long' | 'longshort',
) =>
  `<t:${Math.round(timestamp / 1000)}:${
    format === 'date'
      ? 'D'
      : format == 'time'
      ? 't'
      : format == 'long'
      ? 'F'
      : 'f'
  }>`;
