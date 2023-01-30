import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: async (config: ConfigService) => ({
        timeout: 5000,
        maxRedirects: 10,
        baseURL: config.get('API_BASE_URL'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ApiService, PrismaService],
  exports: [ApiService],
})
export class ApiModule {}
