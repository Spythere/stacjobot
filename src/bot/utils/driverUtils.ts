import { ITimetable } from '../../api/interfaces/timetable.interface';

export abstract class DriverUtils {
  static timetablesFieldValue(timetables: ITimetable[]) {
    return timetables
      .map(
        (tt) =>
          `${tt.driverName} | ${tt.trainCategoryCode} ${tt.trainNo} (${tt.routeDistance}km) \n ID: #${
            tt.id
          } \n ${tt.route.replace('|', ' -> ')}`,
      )
      .join('\n\n');
  }
}
