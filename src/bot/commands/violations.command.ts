import { APIEmbedField, EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { ViolationsDto } from '../dto/violations.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { SlashCommandPipe } from '@discord-nestjs/common';
import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
import { ViolationType, timetables, violations } from '@prisma/client';

const violationTitle: { [key in ViolationType]: string } = {
  SPEED: 'Przekroczenie prędkości',
  CATEGORY: 'Niepoprawna kategoria',
  NUMBER: 'Niepoprawny numer',
  LOCO_COUNT: 'Liczba pojazdów w składzie',
};

function getViolationDesc(violationDoc: violations & { timetables: timetables }) {
  let message = '';

  switch (violationDoc.type) {
    case ViolationType.SPEED:
      const [loco, speed] = violationDoc.value.split(';');
      message = `**Numer**: ${violationDoc.timetables.trainCategoryCode} ${violationDoc.timetables.trainNo}\n**Prędkość**: ${speed}km/h\n**Pojazd**: ${loco}`;
      break;

    case ViolationType.NUMBER:
      const [category, trainNo] = violationDoc.value.split(';');
      message = `**Numer**: ${category} ${trainNo}\n**Autor RJ**: ${violationDoc.timetables.authorName}`;
      break;

    case ViolationType.LOCO_COUNT:
      const locoCount = violationDoc.value;
      message = `**Numer**: ${violationDoc.timetables.trainCategoryCode} ${violationDoc.timetables.trainNo}\n**Liczba pojazdów trakcyjnych**: ${locoCount}`;
      break;

    case ViolationType.CATEGORY:
      const [trainCategory, locoType] = violationDoc.value.split(';');

      message = `**Numer**: ${trainCategory} ${violationDoc.timetables.trainNo}\n**Pojazd**: ${locoType}\n**Autor RJ**: ${violationDoc.timetables.authorName}`;
      break;

    default:
      break;
  }

  message += `\n**Sceneria**: ${violationDoc.stationName}`;
  return message;
}

@Command({
  name: 'wykroczenia',
  description: 'Wykroczenia maszynisty',
})
export class ViolationsCmd {
  constructor(private prisma: PrismaService) {}

  @Handler()
  async onCommand(@InteractionEvent(SlashCommandPipe) dto: ViolationsDto): Promise<InteractionReplyOptions> {
    console.log('v', dto.violationType);

    const violationDocs = await this.prisma.violations.findMany({
      where: {
        timetables: {
          driverName: {
            equals: dto.nick,
            mode: 'insensitive',
          },
          hidden: false,
        },
        type: dto.violationType as ViolationType,
      },

      orderBy: {
        createdAt: 'desc',
      },

      include: {
        timetables: true,
      },

      take: 15,
    });

    if (violationDocs.length == 0)
      return {
        content: 'Brak wyników dla podanych parametrów!',
        ephemeral: true,
      };

    const embed = new EmbedBuilder();
    const embedFields: APIEmbedField[] = violationDocs.map((v) => ({
      name: `<t:${~~(v.createdAt.getTime() / 1000)}:f> | #${v.timetables.id} | ${violationTitle[v.type]}`,
      value: getViolationDesc(v),
    }));

    embed.setTitle(`Wykroczenia maszynisty ${violationDocs[0].timetables.driverName}`);
    embed.setColor('Random');

    embed.setFields(embedFields);

    embed.setDescription('Lista ostatnich wykroczeń maszynisty na serwerze PL1');

    return {
      embeds: [embed],
    };
  }
}
