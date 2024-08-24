import { Test, TestingModule } from '@nestjs/testing';
import { ActivityCmd } from './activity.command';
import { ApiService } from '../../api/api.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('ActivityCmd', () => {
  let activityCommand: ActivityCmd;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        HttpModule.registerAsync({
          useFactory: async (config: ConfigService) => ({
            timeout: 5000,
            maxRedirects: 10,
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
