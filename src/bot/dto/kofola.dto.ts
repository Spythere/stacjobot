import { Choice, Param } from '@discord-nestjs/core';

export enum KofolaOptions {
  'Top' = '1',
  'Notify' = '2',
}

export class KofolaDto {
  @Param({
    name: 'opcje',
    description: 'Opcje losowania',
    required: false,
  })
  @Choice(KofolaOptions)
  options?: KofolaOptions;
}
