import { Param } from '@discord-nestjs/core';

export class ScTopDto {
  @Param({
    name: 'sceneria',
    description: 'Nazwa scenerii',
    required: true,
  })
  name: string;
}
