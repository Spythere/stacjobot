import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UsePipes,
} from '@discord-nestjs/core';

import { TransformPipe } from '@discord-nestjs/common';
import { Injectable } from '@nestjs/common';
import { EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { ApiService } from '../../api/api.service';
import { KonfDto } from '../dto/konfident.dto';

@Injectable()
@Command({
  name: '60',
  description: 'Donosi na podanego użytkownika',
})
@UsePipes(TransformPipe)
export class konfCmd implements DiscordTransformedCommand<KonfDto> {
  constructor(private apiService: ApiService) {}

  async handler(
    @Payload() dto: KonfDto,
    { interaction }: TransformedCommandExecutionContext,
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
