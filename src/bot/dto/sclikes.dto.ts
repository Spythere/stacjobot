import { Param } from '@discord-nestjs/core';

export class SceneryNameDto {
  @Param({
    name: 'nazwa',
    description: 'Pełna nazwa scenerii',
    required: true,
  })
  sceneryName: string;
}
