import { ITimetable } from './timetable.interface';

export interface IDailyStats {
  totalTimetables: number;
  distanceSum: number;
  distanceAvg: number;
  mostActiveDispatchers: IMostActiveDispatcher[];
  mostActiveDrivers: IMostActiveDriver[];
  maxTimetable: ITimetable | null;
  longestDuties: ILongestDuty[];
  globalDiff: IGlobalDiff;
  globalMax: IGlobalMax;
}

export interface IMostActiveDispatcher {
  name: string;
  count: number;
}

export interface IMostActiveDriver {
  name: string;
  distance: number;
}

export interface ILongestDuty {
  name: string;
  duration: number;
  station: string;
}

export interface IGlobalDiff {
  rippedSwitches: number;
  derailments: number;
  skippedStopSignals: number;
  radioStops: number;
  kills: number;
  drivenKilometers: number;
  routedTrains: number;
}

export interface IGlobalMax {
  _max: {
    drivers: number | null;
    dispatchers: number | null;
    timetables: number | null;
  };
}
