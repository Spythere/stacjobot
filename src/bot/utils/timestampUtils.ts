export class TimestampUtils {
  static getDiscordTimestamp(timestampMs: number, timestampType: string) {
    return `<t:${Math.floor(timestampMs / 1000)}:${timestampType}>`;
  }
}
