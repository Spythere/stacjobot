import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { BotGateway } from './bot.gateway';

import { ApiModule } from '../api/api.module';
import { PrismaService } from '../prisma/prisma.service';
import { TimetablePageBuilder } from './page_builders/rjinfo-page-builder';
import { SceneryPageBuilder } from './page_builders/schistory-page-builder.service';

import { commandsIndex } from './commands';
import { PageBuilderService } from './page_builders/builder.service';
import { PrefixCommandHandler } from './handlers/PrefixCommandHandler';
import { UserVerificationService } from './setups/verification';
import { BotPresenceService } from './setups/presence';
import { GlobalCronsListener } from './listeners/eventCrons';
import { GlobalInteractionsListener } from './listeners/globalInteractions';
import { ConfigService } from '@nestjs/config';
import { GatewayIntentBits, PermissionsBitField, Client } from 'discord.js';
import { isDevelopment } from './utils/envUtils';
import { prefixCommandsIndex } from './prefixCommands';
import { serverEventsIndex } from './serverEvents';

@Module({
  imports: [
    DiscordModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        token: configService.get('BOT_TOKEN')!,
        discordClientOptions: {
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildPresences,
          ],
        },
        registerCommandOptions: [
          {
            forGuild: isDevelopment() ? configService.get('BOT_GUILD_ID') : undefined,
            removeCommandsBefore: true,
            allowFactory: (message) => {
              if (message.author.bot || !message.member) return false;

              return (
                message.member.permissions.has(PermissionsBitField.Flags.Administrator) && message.content == '!deploy'
              );
            },
          },
        ],
      }),
      setupClientFactory: (client: Client) => {
        client.setMaxListeners(16);
      },
      inject: [ConfigService],
    }),
    ApiModule,
  ],
  providers: [
    BotGateway,
    GlobalCronsListener,
    GlobalInteractionsListener,
    BotPresenceService,
    PrismaService,
    PageBuilderService,
    UserVerificationService,
    TimetablePageBuilder,
    SceneryPageBuilder,
    PrefixCommandHandler,
    ...commandsIndex,
    ...prefixCommandsIndex,
    ...serverEventsIndex,
  ],
})
export class BotModule {}
