import { TimetableData } from './timetable.interface';

export interface SceneryTimetablesData {
  sceneryTimetables: TimetableData[];
  checkpoints: string[];
  totalCount: number;
  sceneryName?: string;
}
