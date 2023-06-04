import { TimetableData } from './timetable.interface';

export interface TimetablesWithCountResponse {
  timetables: TimetableData[];
  count: number;
}
