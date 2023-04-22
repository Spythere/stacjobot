import { activityCmd } from './activity.command';
import { DrHistoryCmd } from './drhistory.command';
import { DrInfoCmd } from './drinfo.command';
import { DrTopCmd } from './drtop.command';
import { konfCmd } from './konfident.command';
import { rjIdCmd } from './rjId.command';
import { rjInfoCmd } from './rjinfo.command';
import { scHistoryCmd } from './schistory.command';
import { ScLikesCmd } from './sclikes.command';
import { scRjCmd } from './scrj.command';
import { ScTopCmd } from './sctop.command';
import { violationsCmd } from './violations.command';

export const commandsIndex = [
  DrHistoryCmd,
  DrInfoCmd,
  DrTopCmd,
  rjIdCmd,
  rjInfoCmd,
  scHistoryCmd,
  scRjCmd,
  ScTopCmd,
  konfCmd,
  violationsCmd,
  ScLikesCmd,
  activityCmd,
];
