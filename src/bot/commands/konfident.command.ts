import { Injectable } from '@nestjs/common';
import {
  ClientEvents,
  EmbedBuilder,
  InteractionReplyOptions,
} from 'discord.js';
import { ApiService } from '../../api/api.service';
import { KonfDto } from '../dto/konfident.dto';
import { SlashCommandPipe } from '@discord-nestjs/common';
import {
  Command,
  Handler,
  InteractionEvent,
  EventParams,
} from '@discord-nestjs/core';

@Command({
  name: '60',
  description: 'Donosi na podanego użytkownika',
})
export class konfCmd {
  constructor(private apiService: ApiService) {}

  @Handler()
  async onCommand(
    @InteractionEvent(SlashCommandPipe) dto: KonfDto,
    @EventParams() args: ClientEvents['interactionCreate'],
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