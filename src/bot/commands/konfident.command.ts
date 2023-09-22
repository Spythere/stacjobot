import { EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { ApiService } from '../../api/api.service';
import { KonfDto } from '../dto/konfident.dto';
import { SlashCommandPipe } from '@discord-nestjs/common';
import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';

@Command({
  name: '60',
  description: 'Donosi na podanego użytkownika',
})
export class KonfCmd {
  constructor(private apiService: ApiService) {}

  @Handler()
  async onCommand(
    @InteractionEvent(SlashCommandPipe) dto: KonfDto,
  ): Promise<InteractionReplyOptions> {
    const embed = new EmbedBuilder();
    embed.setTitle(`Donos na użytkownika ${dto.nick}`);
    embed.setColor('Random');

    embed.setDescription(
      'Zebrane informacje zostały wysłane do odpowiednich organów sprawiedliwości',
    );

    return {
      embeds: [embed],
    };
  }
}
