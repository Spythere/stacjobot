import { ActivityCmd } from './activity.command';
import { DrHistoryCmd } from './drhistory.command';
import { DrInfoCmd } from './drinfo.command';
import { DrStatusCmd } from './drstatus.command';
import { DrTopCmd } from './drtop.command';
import { KonfCmd } from './konfident.command';
import { RjInfoCmd } from './rjinfo.command';
import { ScHistoryCmd } from './schistory.command';
import { ScTopCmd } from './sctop.command';
import { TD2StatsCmd } from './td2stats.command';
import { ViolationsCmd } from './violations.command';

export const commandsIndex = [
  DrHistoryCmd,
  DrInfoCmd,
  DrTopCmd,
  DrStatusCmd,
  RjInfoCmd,
  ScHistoryCmd,
  ScTopCmd,
  KonfCmd,
  ViolationsCmd,
  ActivityCmd,
  TD2StatsCmd,
];
