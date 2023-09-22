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

  getDispatcherHistory(
    name: string,
  ): Promise<AxiosResponse<IDispatcherHistoryData>> {
    return this.httpService.axiosRef.get('/api/getDispatcherHistory', {
      params: {
        name,
      },
    });
  }

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

  getDispatcherInfo(name: string): Promise<AxiosResponse<IDispatcherInfoData>> {
    return this.httpService.axiosRef.get('/api/getDispatcherInfo', {
      params: { name },
    });
  }

  getDriverInfo(name: string): Promise<AxiosResponse<IDriverInfoData>> {
    return this.httpService.axiosRef.get('/api/getDriverInfo', {
      params: { name },
    });
  }

  getDriverViolations(name: string): Promise<AxiosResponse<IDriverInfoData>> {
    return this.httpService.axiosRef.get('/api/getDriverViolations', {
      params: { name },
    });
  }

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
}
