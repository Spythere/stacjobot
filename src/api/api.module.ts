import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 10,
      baseURL: process.env.API_BASE_URL,
    }),
  ],
  providers: [ApiService, PrismaService],
  exports: [ApiService],
})
export class ApiModule {}
