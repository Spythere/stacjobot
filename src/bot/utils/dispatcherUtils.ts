// -2 - niewpisany, -1 - nieznany, 0 - bez limitu, 1 - zw, 2 - kończy, 3 - brak miejsca, 4 - niedost.

const dispatcherStatusName = {
  '-2': 'ZŁY HASH',
  '-1': 'NIEZNANY',
  '0': 'BEZ LIMITU',
  '1': 'ZARAZ WRACAM',
  '2': 'KOŃCZY',
  '3': 'BRAK MIEJSCA',
  '4': 'NIEDOSTĘPNY',
  '5': 'NIEZALOGOWANY',
};

export class DispatcherUtils {
  static getDispatcherStatus(status: number) {
    if (Object.keys(dispatcherStatusName).indexOf(status.toString()) != -1)
      return dispatcherStatusName[status.toString()];

    return `DO <t:${~~(status / 1000)}:t>`;
  }
}
