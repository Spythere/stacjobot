import { TimetableData } from '../../api/models/timetable.interface';

export abstract class DriverUtils {
  static timetablesFieldValue(timetables: TimetableData[]) {
    return timetables
      .map(
        (tt) =>
          `${tt.driverName} | ${tt.trainCategoryCode} ${tt.trainNo} (${
            tt.routeDistance
          }km) \n ID: #${tt.id} \n ${tt.route.replace('|', ' -> ')}`,
      )
      .join('\n\n');
  }
}
