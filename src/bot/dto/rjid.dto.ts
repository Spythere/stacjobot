import { Param, ParamType } from '@discord-nestjs/core';

export class RjIdDto {
  @Param({
    name: 'id',
    description: 'Numer ID rozkładu jazdy (bez znaku #)',
    required: true,
  })
  timetableId: string;
}
