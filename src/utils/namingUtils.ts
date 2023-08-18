export function getLitersInPolish(l: number) {
  return l == 1
    ? 'litr'
    : l % 10 >= 2 && l % 10 <= 4 && (l % 100 < 10 || l % 100 >= 20)
    ? 'litry'
    : 'litrów';
}
