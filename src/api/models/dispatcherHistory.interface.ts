export interface History {
  stationName: string;
  timestampFrom: number;
  timestampTo: number;
  dispatcherName: string;
}

export interface HistoryStats {
  _count: {
    _all: number;
  };
}

export interface DispatcherHistoryData {
  history: History[];
  historyStats: HistoryStats;
  dispatcherName: string;
}
