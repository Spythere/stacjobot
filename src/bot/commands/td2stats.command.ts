import { SlashCommandPipe } from '@discord-nestjs/common';
import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
import { InteractionReplyOptions, EmbedBuilder } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { TD2StatsDto } from '../dto/td2stats.dto';

@Command({
  name: 'td2stats',
  description: 'Statystyki TD2',
})
export class ScTopCmd {
  constructor(private prisma: PrismaService) {}

  @Handler()
  async onCommand(
    @InteractionEvent(SlashCommandPipe) dto: TD2StatsDto,
  ): Promise<InteractionReplyOptions> {
    return {
      content: 'test',
    };
  }
}
