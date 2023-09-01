// -2 - niewpisany, -1 - nieznany, 0 - bez limitu, 1 - zw, 2 - kończy, 3 - brak miejsca, 4 - niedost.

const dispatcherStatusName = {
  '-2': 'NIEWPISANY',
  '-1': 'NIEDOSTĘPNY',
  '0': 'BEZ LIMITU',
  '1': 'ZARAZ WRACAM',
  '2': 'KOŃCZY',
  '3': 'BRAK MIEJSCA',
  '4': 'NIEZNANY',
};

export class DispatcherUtils {
  static getDispatcherStatus(status: number) {
    if (status <= 4) return dispatcherStatusName[status.toString()];

    return `DO <t:${~~(status / 1000)}:t>`;
  }
}
