import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { DispatcherHistoryData } from './models/dispatcherHistory.interface';
import { AxiosResponse } from 'axios';
import { DispatcherInfoData } from './models/dispatcherInfo.interface';
import { PrismaService } from '../prisma/prisma.service';
import { timetables } from '@prisma/client';
import { DriverInfoData } from './models/driverInfo.interface';
import { SceneryTimetablesData } from './models/sceneryTimetables.interface';
import { TimetableData } from './models/timetable.interface';

@Injectable()
export class ApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  getDispatcherHistory(
    name: string,
  ): Promise<AxiosResponse<DispatcherHistoryData>> {
    return this.httpService.axiosRef.get('/api/getDispatcherHistory', {
      params: {
        name,
      },
    });
  }

  getDispatcherInfo(name: string): Promise<AxiosResponse<DispatcherInfoData>> {
    return this.httpService.axiosRef.get('/api/getDispatcherInfo', {
      params: { name },
    });
  }

  getDriverInfo(name: string): Promise<AxiosResponse<DriverInfoData>> {
    return this.httpService.axiosRef.get('/api/getDriverInfo', {
      params: { name },
    });
  }

  getTimetables(dto: any): Promise<AxiosResponse<TimetableData[]>> {
    return this.httpService.axiosRef.get('/api/getTimetables', {
      params: {
        ...dto,
      },
    });
  }

  getSceneryTimetables(
    name: string,
    countFrom: number,
    countLimit: number,
  ): Promise<AxiosResponse<SceneryTimetablesData>> {
    return this.httpService.axiosRef.get('/api/getSceneryTimetables', {
      params: {
        name,
        countFrom,
        countLimit,
      },
    });
  }
}
