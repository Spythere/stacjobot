import { Param } from '@discord-nestjs/core';

export class ViolationsDto {
  @Param({
    name: 'nick',
    description: 'Nick użytkownika',
    required: true,
  })
  nick: string;
}
