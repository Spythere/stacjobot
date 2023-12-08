import { SlashCommandPipe } from '@discord-nestjs/common';
import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
import { InteractionReplyOptions, EmbedBuilder, Attachment, AttachmentBuilder } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { TD2StatsDto } from '../dto/td2stats.dto';
import { ApiService } from '../../api/api.service';

@Command({
  name: 'td2stats',
  description: 'Statystyki TD2',
})
export class TD2StatsCmd {
  constructor(
    private prisma: PrismaService,
    private apiService: ApiService,
  ) {}

  @Handler()
  async onCommand(@InteractionEvent(SlashCommandPipe) dto: TD2StatsDto): Promise<InteractionReplyOptions> {
    const graph = await this.apiService.getTrafficStats(dto);

    const imageAttachment = new AttachmentBuilder(graph.data);
    imageAttachment.setName('td2stats');

    return {
      files: [
        {
          attachment: imageAttachment.attachment,
        },
      ],
    };
  }
}
