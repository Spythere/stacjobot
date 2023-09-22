export type IDispatchers = IDispatcher[];

export interface IDispatcher {
  id: number;
  currentDuration: number;
  dispatcherId: number;
  dispatcherName: string;
  isOnline: boolean;
  lastOnlineTimestamp: number;
  region: string;
  stationHash: string;
  stationName: string;
  timestampFrom: number;
  timestampTo: number;
  dispatcherLevel: number;
  dispatcherIsSupporter: boolean;
  createdAt: string;
  updatedAt: string;
  dispatcherStatus: number;
  dispatcherRate: number;
  statusHistory: string[];
  hidden: boolean;
}

export interface IDispatchersWithCount {
  dispatchers: IDispatcher[];
  count: number;
}
