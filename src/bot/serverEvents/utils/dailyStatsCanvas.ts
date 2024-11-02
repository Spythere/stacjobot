import { registerFont, createCanvas, Image, Canvas, CanvasRenderingContext2D, JPEGStream } from 'canvas';
import { formatDuration, intervalToDuration } from 'date-fns';
import { pl } from 'date-fns/locale';
import { join } from 'path';
import { IDailyStats } from '../../../api/interfaces/dailyStats.interface';

enum TextColor {
  PRIMARY = 'white',
  ACCENT = '#28DFEB',
}

enum FontWeight {
  REGULAR = '400',
  BOLD = '600',
}

enum FontSize {
  NUMERIC_STAT = 60,
  SEGMENT_STAT = 45,
}

interface ISegment {
  text: string;
  textColor: TextColor;
  fontWeight: FontWeight;
  fontSize: number;
}

export default class DailyStatsCanvas {
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;
  stats: IDailyStats;

  setup() {
    // Font register
    registerFont(join(process.cwd(), 'assets', 'Lato.ttf'), {
      family: 'Lato',
      weight: FontWeight.REGULAR,
    });

    registerFont(join(process.cwd(), 'assets', 'Lato-Bold.ttf'), {
      family: 'Lato',
      weight: FontWeight.BOLD,
    });

    // Canvas & Context setup
    this.canvas = createCanvas(1920, 1171);
    this.ctx = this.canvas.getContext('2d');
  }

  getDailyStatsData(stats: IDailyStats) {
    this.stats = stats;
  }

  prepareCanvasJPEG(): JPEGStream | null {
    if (!this.canvas || !this.ctx || !this.stats) return null;

    this.renderImage(join(process.cwd(), 'assets', 'stats-template.jpg'));

    this.renderNumericStats();

    this.renderLongestDuty();
    this.renderMostActiveDriver();
    this.renderMostActiveDispatcher();
    this.renderLongestTimetable();

    return this.canvas.createJPEGStream();
  }

  private renderTextSegments(segments: ISegment[], y: number) {
    const widthTotal = segments.reduce((acc, s) => {
      this.ctx.font = `${s.fontWeight} ${s.fontSize}px Lato`;

      acc += this.ctx.measureText(s.text).width;
      return acc;
    }, 0);

    const textStartX = (1920 - widthTotal) / 2;

    let x = textStartX;
    this.ctx.textAlign = 'start';

    segments.forEach((s) => {
      this.ctx.font = `${s.fontWeight} ${s.fontSize}px Lato`;
      this.ctx.fillStyle = s.textColor;
      this.ctx.fillText(s.text, x, y + s.fontSize);

      x += this.ctx.measureText(s.text).width;
    });
  }

  private renderImage(src: string) {
    const img = new Image();

    img.onload = () => this.ctx.drawImage(img, 0, 0);

    img.onerror = (err) => {
      console.error('Ups! Wystąpił błąd podczas pobierania assetów:', err);
    };

    img.src = src;
  }

  private renderNumericStats() {
    this.ctx.fillStyle = TextColor.ACCENT;
    this.ctx.textAlign = 'center';
    this.ctx.font = `${FontWeight.BOLD} ${FontSize.NUMERIC_STAT}px 'Lato'`;

    const numericStats = [
      { x: 257, y: 100, content: `${this.stats.totalTimetables}` },
      { x: 906, y: 100, content: `${this.stats.distanceSum.toFixed(2)}km` },
      { x: 1609, y: 100, content: `${this.stats.distanceAvg.toFixed(2)}km` },
      { x: 225, y: 290, content: `${this.stats.globalDiff.rippedSwitches}` },
      { x: 599, y: 290, content: `${this.stats.globalDiff.derailments}` },
      {
        x: 1002,
        y: 290,
        content: `${this.stats.globalDiff.skippedStopSignals}`,
      },
      { x: 1456, y: 290, content: `${this.stats.globalDiff.radioStops}` },
      { x: 1788, y: 290, content: `${this.stats.globalDiff.kills}` },

      // { x: 960, y: 483,  content: `${this.stats.longestDuties[0].name}` },
      // { x: 960, y: 662,  content: `${this.stats.mostActiveDrivers[0].name}` },
      // { x: 960, y: 841,  content: `${this.stats.mostActiveDispatchers[0].name}` },
      // { x: 960, y: 1020,  content: `${this.stats.maxTimetable.driverName}` },
    ];

    numericStats.forEach((td) => {
      this.ctx.fillText(td.content, td.x, td.y + FontSize.NUMERIC_STAT);
    });
  }

  private renderLongestDuty() {
    if (this.stats.longestDuties.length == 0) return;

    const { duration, name, station } = this.stats.longestDuties[0];

    const longestDutyTime = formatDuration(
      intervalToDuration({
        start: 0,
        end: duration,
      }),
      { locale: pl, format: ['hours', 'minutes'] },
    );

    const segments: ISegment[] = [
      {
        text: `${name} `,
        textColor: TextColor.PRIMARY,
        fontWeight: FontWeight.BOLD,
        fontSize: FontSize.SEGMENT_STAT,
      },
      {
        text: '- ',
        textColor: TextColor.PRIMARY,
        fontWeight: FontWeight.REGULAR,
        fontSize: FontSize.SEGMENT_STAT,
      },
      {
        text: `${longestDutyTime} `,
        textColor: TextColor.ACCENT,
        fontWeight: FontWeight.BOLD,
        fontSize: FontSize.SEGMENT_STAT,
      },
      {
        text: '- ',
        textColor: TextColor.PRIMARY,
        fontWeight: FontWeight.REGULAR,
        fontSize: FontSize.SEGMENT_STAT,
      },

      {
        text: `${station}`,
        textColor: TextColor.PRIMARY,
        fontWeight: FontWeight.BOLD,
        fontSize: FontSize.SEGMENT_STAT,
      },
    ];

    this.renderTextSegments(segments, 483);
  }

  private renderMostActiveDriver() {
    if (this.stats.mostActiveDrivers.length == 0) return;

    const { distance, name } = this.stats.mostActiveDrivers[0];

    const segments: ISegment[] = [
      {
        text: `${name} `,
        textColor: TextColor.PRIMARY,
        fontWeight: FontWeight.BOLD,
        fontSize: FontSize.SEGMENT_STAT,
      },
      {
        text: '- ',
        textColor: TextColor.PRIMARY,
        fontWeight: FontWeight.REGULAR,
        fontSize: FontSize.SEGMENT_STAT,
      },
      {
        text: `${distance.toFixed(2)}km `,
        textColor: TextColor.ACCENT,
        fontWeight: FontWeight.BOLD,
        fontSize: FontSize.SEGMENT_STAT,
      },
      {
        text: 'potwierdzonego dystansu',
        textColor: TextColor.PRIMARY,
        fontWeight: FontWeight.REGULAR,
        fontSize: FontSize.SEGMENT_STAT,
      },
    ];

    this.renderTextSegments(segments, 662);
  }

  private renderMostActiveDispatcher() {
    if (this.stats.mostActiveDispatchers.length == 0) return;

    const { count, name } = this.stats.mostActiveDispatchers[0];

    const segments: ISegment[] = [
      {
        text: `${name} `,
        textColor: TextColor.PRIMARY,
        fontWeight: FontWeight.BOLD,
        fontSize: FontSize.SEGMENT_STAT,
      },
      {
        text: '- stworzone ',
        textColor: TextColor.PRIMARY,
        fontWeight: FontWeight.REGULAR,
        fontSize: FontSize.SEGMENT_STAT,
      },
      {
        text: `${count} RJ`,
        textColor: TextColor.ACCENT,
        fontWeight: FontWeight.BOLD,
        fontSize: FontSize.SEGMENT_STAT,
      },
    ];

    this.renderTextSegments(segments, 841);
  }

  private renderLongestTimetable() {
    if (!this.stats.maxTimetable) return;

    const { routeDistance, trainCategoryCode, trainNo, route, id, driverName, authorName } = this.stats.maxTimetable;

    const segmentsTop: ISegment[] = [
      {
        text: `${trainCategoryCode} ${trainNo} `,
        textColor: TextColor.ACCENT,
        fontWeight: FontWeight.BOLD,
        fontSize: FontSize.SEGMENT_STAT,
      },
      {
        text: `${route.replace('|', ' -> ')}`,
        textColor: TextColor.PRIMARY,
        fontWeight: FontWeight.BOLD,
        fontSize: FontSize.SEGMENT_STAT,
      },
    ];

    const segmentsBottom: ISegment[] = [
      {
        text: `${routeDistance}km`,
        textColor: TextColor.ACCENT,
        fontWeight: FontWeight.BOLD,
        fontSize: FontSize.SEGMENT_STAT,
      },
      {
        text: ` - stworzony przez: ${authorName} dla: ${driverName}`,
        textColor: TextColor.PRIMARY,
        fontWeight: FontWeight.REGULAR,
        fontSize: FontSize.SEGMENT_STAT,
      },
    ];

    this.renderTextSegments(segmentsTop, 1020);
    this.renderTextSegments(segmentsBottom, 1085);
  }
}
