export type ITimetables = ITimetable[];

export interface ITimetable {
  id: number;
  allStopsCount: number;
  authorId: number | null;
  authorName: string | null;
  beginDate: string;
  confirmedStopsCount: number;
  currentDistance: number;
  driverId: number;
  driverName: string;
  endDate: string;
  fulfilled: boolean;
  route: string;
  routeDistance: number;
  sceneriesString: string;
  scheduledBeginDate: string;
  scheduledEndDate: string;
  terminated: boolean;
  timetableId: number;
  trainCategoryCode: string;
  trainNo: number;
  stockString: string | null;
  stockMass: number | null;
  stockLength: number | null;
  maxSpeed: number | null;
  hashesString: string | null;
  currentSceneryName: string | null;
  currentSceneryHash: string | null;
  skr: boolean | null;
  twr: boolean | null;
  driverIsSupporter: boolean;
  driverLevel: number | null;
  createdAt: string;
  updatedAt: Date | null;
}

export interface ITimetablesWithCount {
  timetables: ITimetables;
  count: number;
}
