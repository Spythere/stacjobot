import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { IDriverInfoData } from './interfaces/driverInfo.interface';
import {
  ITimetables,
  ITimetablesWithCount,
} from './interfaces/timetable.interface';
import { IDispatcherInfoData } from './interfaces/dispatcherInfo.interface';
import { IDispatcherHistoryData } from './interfaces/dispatcherHistory.interface';
import { DispatchersDto } from './dtos/dispatchers.dto';
import {
  IDispatchers,
  IDispatchersWithCount,
} from './interfaces/dispatcher.interface';

@Injectable()
export class ApiService {
  constructor(private readonly httpService: HttpService) {}

  /* api/getDispatcherHistory */
  getDispatcherHistory(
    name: string,
  ): Promise<AxiosResponse<IDispatcherHistoryData>> {
    return this.httpService.axiosRef.get('/api/getDispatcherHistory', {
      params: {
        name,
      },
    });
  }

  /* api/getDispatchers */
  getDispatchers(dto: DispatchersDto): Promise<AxiosResponse<IDispatchers>> {
    return this.httpService.axiosRef.get('/api/getDispatchers', {
      params: dto,
    });
  }

  getDispatchersWithCount(
    dto: DispatchersDto,
  ): Promise<AxiosResponse<IDispatchersWithCount>> {
    return this.httpService.axiosRef.get('/api/getDispatchers', {
      params: {
        ...dto,
        countQuery: true,
      },
    });
  }

  /* api/getDispatcherInfo */
  getDispatcherInfo(name: string): Promise<AxiosResponse<IDispatcherInfoData>> {
    return this.httpService.axiosRef.get('/api/getDispatcherInfo', {
      params: { name },
    });
  }

  /* api/getDriverInfo */
  getDriverInfo(name: string): Promise<AxiosResponse<IDriverInfoData>> {
    return this.httpService.axiosRef.get('/api/getDriverInfo', {
      params: { name },
    });
  }

  /* api/getDriverViolations */
  getDriverViolations(name: string): Promise<AxiosResponse<IDriverInfoData>> {
    return this.httpService.axiosRef.get('/api/getDriverViolations', {
      params: { name },
    });
  }

  /* api/getTimetables */
  getTimetables(dto: any): Promise<AxiosResponse<ITimetables>> {
    return this.httpService.axiosRef.get('/api/getTimetables', {
      params: {
        ...dto,
      },
    });
  }

  getTimetablesWithCount(
    dto: any,
  ): Promise<AxiosResponse<ITimetablesWithCount>> {
    return this.httpService.axiosRef.get('/api/getTimetables', {
      params: {
        ...dto,
        countQuery: 1,
      },
    });
  }

  /* api/getTrafficStats */
  getTrafficStats(): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.get('/api/getTrafficStats', {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'image/png',
      },
    });
  }
}
