import axios, { AxiosError, AxiosResponse } from 'axios';
import config from '../config';
import { Routes } from '../constant';
import { GetResponse, Identifier, PostIncident } from '../types/pagerduty';
import { replace } from '../utils/utils';

export type PagerDutyOptions = {
   api_token: string;
   user_email?: string
}

export class PagerDutyClient {
   private readonly options: PagerDutyOptions;

   constructor(
      options: PagerDutyOptions
   ) {
      this.options = options;
   }

   public getServices(): Promise<GetResponse> {
      const url: string = `${config.PAGERDUTY.URL}${Routes.PagerDuty.ServicesPathPrefix}`;
      var configMethod = {
         headers: {
            'Authorization': `Token token=${this.options?.api_token}`,
            'Content-Type': 'application/json'
         }
      };

      return axios.get(url, configMethod)
         .then((response: AxiosResponse<any>) => response.data)
         .catch(function (error) {
            console.log(error);
         });
   }

   public getIncidentByID(identifier: Identifier): Promise<GetResponse> {
      const path: string = `${replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, identifier.identifier)}`;
      const url: string = `${config.PAGERDUTY.URL}${path}`;
      var configMethod = {
         headers: {
            'Authorization': `Token token=${this.options?.api_token}`,
            'Content-Type': 'application/json'
         }
      };

      return axios.get(url, configMethod)
         .then((response: AxiosResponse<any>) => response.data)
         .catch(function (error) {
            console.log(error);
         });
   }
   public postNewIncident(body: PostIncident): Promise<any> {
      const url: string = `${config.PAGERDUTY.URL}${Routes.PagerDuty.IncidentsPathPrefix}`;
      var configMethod = {
         headers: {
            'Authorization': `Token token=${this.options.api_token}`,
            'Content-Type': 'application/json',
            'From': `${this.options?.user_email}`
         }
      };

      return axios.post(url, body, configMethod)
         .then((response: AxiosResponse<any>) => response.data);
   }

   public postNewIncidentNote(identifier: Identifier, body: any): Promise<any> {
      const path: string = `${replace(Routes.PagerDuty.IncidentPathPrefix , Routes.PathsVariable.Identifier, identifier.identifier)}`;
      const url: string = `${config.PAGERDUTY.URL}${path}${Routes.PagerDuty.NotesPathPrefix}`;
      var configMethod = {
         headers: {
            'Authorization': `Token token=${this.options.api_token}`,
            'Content-Type': 'application/json'
         }
      };

      return axios.post(url, body, configMethod)
         .then((response: AxiosResponse<any>) => response.data);
   }

   public getUsers(): Promise<GetResponse> {
      const url: string = `${config.PAGERDUTY.URL}${Routes.PagerDuty.UsersPathPrefix}`;
      var configMethod = {
         headers: {
            'Authorization': `Token token=${this.options?.api_token}`,
            'Content-Type': 'application/json'
         }
      };

      return axios.get(url, configMethod)
         .then((response: AxiosResponse<any>) => response.data);
   }
}