import axios, { AxiosError, AxiosResponse } from 'axios';
import config from '../config';
import { Routes } from '../constant';
import { GetResponse, Identifier, Incident, PostIncident, PostIncidentNote } from '../types/pagerduty';
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

   private get headersFrom() {
      return {
         headers: {
            'Authorization': `Token token=${this.options?.api_token}`,
            'From': `${this.options?.user_email}`,
            'Content-Type': 'application/json'
         }
      };
   }

   public getServices(): Promise<GetResponse> {
      const url: string = `${config.PAGERDUTY.URL}${Routes.PagerDuty.ServicesPathPrefix}`;
      var configMethod = this.headersFrom;

      return axios.get(url, configMethod)
         .then((response: AxiosResponse<any>) => response.data)
         .catch(function (error) {
            console.log(error);
         });
   }

   public getIncidentByID(identifier: Identifier): Promise<{ incident: Incident }> {
      const path: string = `${replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, identifier.identifier)}`;
      const url: string = `${config.PAGERDUTY.URL}${path}`;
      var configMethod = this.headersFrom;

      return axios.get(url, configMethod)
         .then((response: AxiosResponse<any>) => response.data)
         .catch(function (error) {
            console.log(error);
         });
   }
   public postNewIncident(body: PostIncident): Promise<any> {
      const url: string = `${config.PAGERDUTY.URL}${Routes.PagerDuty.IncidentsPathPrefix}`;
      var configMethod = this.headersFrom;

      return axios.post(url, body, configMethod)
         .then((response: AxiosResponse<any>) => response.data);
   }

   public postNewIncidentNote(identifier: Identifier, body: PostIncidentNote): Promise<any> {
      const path: string = `${replace(Routes.PagerDuty.IncidentPathPrefix , Routes.PathsVariable.Identifier, identifier.identifier)}`;
      const url: string = `${config.PAGERDUTY.URL}${path}${Routes.PagerDuty.NotesPathPrefix}`;
      var configMethod = this.headersFrom;

      return axios.post(url, body, configMethod)
         .then((response: AxiosResponse<any>) => response.data);
   }

   public getUsers(): Promise<GetResponse> {
      const url: string = `${config.PAGERDUTY.URL}${Routes.PagerDuty.UsersPathPrefix}`;
      var configMethod = this.headersFrom;

      return axios.get(url, configMethod)
         .then((response: AxiosResponse<any>) => response.data);
   }
}