import { Test, TestingModule } from '@nestjs/testing';
import { ActivityCmd } from './activity.command';
import { ApiService } from '../../api/api.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscordModule } from '@discord-nestjs/core';

describe('ActivityCmd', () => {
  let activityCommand: ActivityCmd;

  beforeEach(async () => {
    
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DiscordModule.forFeature(),
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        HttpModule.registerAsync({
          useFactory: async (config: ConfigService) => ({
            baseURL: config.get('API_BASE_URL'),
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [ActivityCmd, ApiService, ConfigService],
    }).compile();

    activityCommand = module.get<ActivityCmd>(ActivityCmd);
  });

  it('should be defined', () => {
    expect(activityCommand).toBeDefined();
  });
});
