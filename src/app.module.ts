import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscordModule } from '@discord-nestjs/core';
import { Client, GatewayIntentBits, PermissionsBitField } from 'discord.js';
import { BotModule } from './bot/bot.module';
import { ApiModule } from './api/api.module';
import { ScheduleModule } from '@nestjs/schedule';
import { isDevelopment } from './bot/utils/envUtils';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'assets'),
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DiscordModule.forRootAsync({
      imports: [ConfigModule.forRoot()],
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
        client.setMaxListeners(15);
      },
      inject: [ConfigService],
    }),
    BotModule,
    ApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
