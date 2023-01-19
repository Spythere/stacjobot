import { Param } from '@discord-nestjs/core';

export class RjNickDto {
  @Param({
    name: 'nick',
    description: 'Nick maszynisty',
    required: true,
  })
  nick: string;
}
