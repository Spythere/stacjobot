export interface IActiveDataResponse {
  trains: IActiveTrain[];
  activeSceneries: IActiveScenery[];
}

export interface IActiveTrain {
  id: string;
  trainNo: number;

  mass: number;
  length: number;
  speed: number;

  signal: string;
  distance: number;
  connectedTrack: string;
  stockString: string;

  driverName: string;
  driverId: number;
  driverIsSupporter: boolean;
  driverLevel: number;

  currentStationName: string;
  currentStationHash?: string;

  online: boolean;
  lastSeen: number;
  region: string;
  timetable?: IActiveTrainTimetable;
  isTimeout: boolean;
}

export interface IActiveTrainTimetable {
  timetableId: number;
  category: string;
  route: string;
  stopList: IActiveTrainTimetableStop[];
  TWR: boolean;
  SKR: boolean;
  sceneries: string[];
  path: string;
}

export interface IActiveTrainTimetableStop {
  stopName: string;
  stopNameRAW: string;
  stopType: string;
  stopDistance: number;
  pointId: number;

  mainStop: boolean;

  arrivalLine?: string;
  arrivalTimestamp: number;
  arrivalRealTimestamp: number;
  arrivalDelay: number;

  departureLine?: string;
  departureTimestamp: number;
  departureRealTimestamp: number;
  departureDelay: number;

  comments?: any;

  beginsHere: boolean;
  terminatesHere: boolean;
  confirmed: boolean;
  stopped: boolean;
  stopTime: number;
}

export interface IActiveScenery {
  dispatcherId: number;
  dispatcherName: string;
  dispatcherIsSupporter: boolean;
  stationName: string;
  stationHash: string;
  region: string;
  maxUsers: number;
  currentUsers: number;
  spawn: number;
  lastSeen: number;
  dispatcherExp: number;
  nameFromHeader: string;
  spawnString: string;
  networkConnectionString: string;
  isOnline: number;
  dispatcherRate: number;
  dispatcherStatus: number;
}
