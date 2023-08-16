import { isDevelopment } from '../utils/envUtils';

export const customEmojiIds = {
  kofola: isDevelopment()
    ? '<:utk:1139170160327000064>'
    : '<:kofola2:1107627668293292083>',
  rewident: isDevelopment()
    ? '<a:rewident:1139173995476963398>'
    : '<a:rewident:1108083125147406389>',
  bagiety: isDevelopment()
    ? '<:utk:1139170160327000064>'
    : '<a:bagiety:1084565542930751649>',
  tenseSmash: isDevelopment()
    ? '<a:tenseSmash:1140620190493720596>'
    : '<a:tenseSmash:1140423227634630657>',
  motosraczek: isDevelopment()
    ? '<:motosraczek3:1141372549117247488>'
    : '<:motosraczek3:1108082359506587718>',
};
