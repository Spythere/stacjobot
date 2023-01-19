import { Param } from '@discord-nestjs/core';

export class DrNickDto {
  @Param({
    name: 'nick',
    description: 'Nick dyżurnego',
    required: true,
  })
  nick: string;
}
