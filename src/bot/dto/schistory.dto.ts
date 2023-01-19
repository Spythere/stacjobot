import { Param } from '@discord-nestjs/core';

export class ScHistoryDto {
  @Param({
    name: 'nazwa',
    description: 'Pełna nazwa scenerii',
    required: true,
  })
  sceneryName: string;
}
