import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { DispatcherHistoryData } from './models/dispatcherHistory.interface';
import { AxiosResponse } from 'axios';
import { DispatcherInfoData } from './models/dispatcherInfo.interface';
import { PrismaService } from '../prisma/prisma.service';
import { DriverInfoData } from './models/driverInfo.interface';
import { TimetableData } from './models/timetable.interface';
import { TimetablesWithCountResponse } from './models/timetableWithCount.interface';

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

  getDriverViolations(name: string): Promise<AxiosResponse<DriverInfoData>> {
    return this.httpService.axiosRef.get('/api/getDriverViolations', {
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

  getTimetablesWithCount(
    dto: any,
  ): Promise<AxiosResponse<TimetablesWithCountResponse>> {
    return this.httpService.axiosRef.get('/api/getTimetables', {
      params: {
        ...dto,
        countQuery: 1,
      },
    });
  }
}
