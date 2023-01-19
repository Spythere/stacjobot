export interface DriverInfoData {
  _sum: {
    routeDistance?: number;
    confirmedStopsCount?: number;
    allStopsCount?: number;
    currentDistance?: number;
  };

  _count: {
    fulfilled: number;
    terminated: number;
    _all: number;
  };

  _max: {
    routeDistance?: number;
  };

  _avg: {
    routeDistance?: number;
  };
}
