import { Injectable } from '@nestjs/common';
import { SceneryPageBuilder } from './schistory-page-builder.service';
import { TimetablePageBuilder } from './rjinfo-page-builder';
import { BuilderId } from './builder.interfaces';

@Injectable()
export class PageBuilderService {
  constructor(
    private sceneryBuilder: SceneryPageBuilder,
    private timetableBuilder: TimetablePageBuilder,
  ) {}

  generatePage(builderId: BuilderId, stationName: string, pageNo: number) {
    switch (builderId) {
      case 'schistory':
        return this.sceneryBuilder.generatePage(stationName, pageNo);
      case 'rjinfo':
      default:
        return this.timetableBuilder.generatePage(stationName, pageNo);
    }
  }
}
