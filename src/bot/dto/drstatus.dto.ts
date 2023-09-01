import { Param } from '@discord-nestjs/core';

export class DrStatusDto {
  @Param({
    name: 'nick',
    description: 'Nick dyżurnego',
    required: true,
  })
  nick: string;
}
