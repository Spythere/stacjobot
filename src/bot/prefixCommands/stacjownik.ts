import { Message } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StacjownikPrefixCmd {
  constructor(private readonly prisma: PrismaService) {}

  async handleCommand(message: Message) {
    message.reply('xd');
  }
}
