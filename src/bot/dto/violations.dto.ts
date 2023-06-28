import { Choice, Param } from '@discord-nestjs/core';
import { ViolationType } from '@prisma/client';

const violationChocies = {
  'Przekroczenie prędkości': ViolationType.SPEED,
  'Niepoprawny numer': ViolationType.NUMBER,
  'Niepoprawna kategoria': ViolationType.CATEGORY,
  'Przekroczenie liczby pojazdów': ViolationType.LOCO_COUNT,
};

export class ViolationsDto {
  @Param({
    name: 'nick',
    description: 'Nick użytkownika',
    required: true,
  })
  nick: string;

  @Param({
    name: 'type',
    description: 'Typ wykroczenia',
    required: false,
  })
  @Choice(violationChocies)
  type?: ViolationType;
}
