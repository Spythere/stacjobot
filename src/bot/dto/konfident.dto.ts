import { Param } from '@discord-nestjs/core';

export class KonfDto {
  @Param({
    name: 'nick',
    description: 'Nick użytkownika',
    required: true,
  })
  nick: string;
}
