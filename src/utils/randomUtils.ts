export function randomRangeInteger(max: number, min: number) {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

export function randomRangeFloat(max: number, min: number) {
  return Math.random() * (max - min) + min;
}
