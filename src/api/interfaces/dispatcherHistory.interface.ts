export interface IHistory {
  stationName: string;
  timestampFrom: number;
  timestampTo: number;
  dispatcherName: string;
}

export interface IHistoryStats {
  _count: {
    _all: number;
  };
}

export interface IDispatcherHistoryData {
  history: IHistory[];
  historyStats: IHistoryStats;
  dispatcherName: string;
}
