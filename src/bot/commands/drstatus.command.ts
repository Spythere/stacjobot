import { Command, Handler, IA } from '@discord-nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { SlashCommandPipe } from '@discord-nestjs/common';
import { EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { DrStatusDto } from '../dto/drstatus.dto';
import { DispatcherUtils } from '../utils/dispatcherUtils';

@Command({
  name: 'drstatus',
  description: 'Historia statusów dyżurnego',
})
export class DrStatusCmd {
  constructor(private prisma: PrismaService) {}

  @Handler()
  async onCommand(
    @IA(SlashCommandPipe) dto: DrStatusDto,
  ): Promise<InteractionReplyOptions> {
    const drServices = await this.prisma.dispatchers.findMany({
      where: {
        dispatcherName: {
          equals: dto.nick,
          mode: 'insensitive',
        },
        statusHistory: {
          isEmpty: false,
        },
      },
      orderBy: {
        id: 'desc',
      },
      take: 10,
    });

    if (drServices.length == 0)
      return {
        content: `Nie znaleziono historii statusów dla użytkownika ${dto.nick}!`,
      };

    const embed = new EmbedBuilder()
      .setTitle(
        `Ostatnie zmiany statusów dyżurnego ${drServices[0].dispatcherName}`,
      )
      .setFields(
        drServices.map((serv) => {
          const dcDateTimestamp = `<t:${~~(
            serv.createdAt.getTime() / 1000
          )}:D>`;

          const statusList = serv.statusHistory.reverse().map((sh) => {
            const [timestamp, status] = sh.split('@');
            const dcTimeTimestamp = `<t:${~~(+timestamp / 1000)}:t>`;
            const formattedStatus = DispatcherUtils.getDispatcherStatus(
              +status,
            );

            return `- ${dcTimeTimestamp}: ${formattedStatus}`;
          });

          return {
            name: `${serv.stationName} - ${dcDateTimestamp}`,
            value: `${statusList.join('\n')}`,
          };
        }),
      );

    return {
      embeds: [embed],
    };
  }
}
