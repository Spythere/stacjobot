import { ITimetable } from './timetable.interface';

export interface ISceneryTimetablesData {
  sceneryTimetables: ITimetable[];
  checkpoints: string[];
  totalCount: number;
  sceneryName?: string;
}
