import axios, { AxiosError, AxiosResponse } from 'axios';
import config from '../config';
import { Routes } from '../constant';
import { GetResponse, Identifier, Incident, PostIncident, PostIncidentNote, UpdateIncident } from '../types/pagerduty';
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
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.pagerduty+json;version=2'
         }
      };
   }

   public getServices(): Promise<GetResponse> {
      const url: string = `${config.PAGERDUTY.URL}${Routes.PagerDuty.ServicesPathPrefix}`;
      var configMethod = this.headersFrom;

      return axios.get(url, configMethod)
         .then((response: AxiosResponse<any>) => response.data)
         .catch(function (error) {
         });
   }

   public getIncidentByID(identifier: Identifier): Promise<{ incident: Incident }> {
      const path: string = `${replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, identifier.identifier)}`;
      const url: string = `${config.PAGERDUTY.URL}${path}`;
      var configMethod = this.headersFrom;

      return axios.get(url, configMethod)
         .then((response: AxiosResponse<any>) => response.data)
         .catch(function (error) {
         });
   }

   public updateIncidentByID(identifier: Identifier, incident: UpdateIncident): Promise<{ incident: Incident }> {
      const path: string = `${replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, identifier.identifier)}`;
      const url: string = `${config.PAGERDUTY.URL}${path}`;
      var configMethod = this.headersFrom;

      return axios.put(url, incident,  configMethod)
         .then((response: AxiosResponse<any>) =>{
            console.log(response.data);
            return response.data
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
         .then((response: AxiosResponse<any>) => response.data)
         .catch(err => console.log(err))
   }

   public getUsers(): Promise<GetResponse> {
      const url: string = `${config.PAGERDUTY.URL}${Routes.PagerDuty.UsersPathPrefix}`;
      var configMethod = this.headersFrom;

      return axios.get(url, configMethod)
         .then((response: AxiosResponse<any>) => response.data);
   }

   public getUserByID(identifier: Identifier): Promise<GetResponse> {
      const path: string = `${replace(Routes.PagerDuty.UserPathPrefix, Routes.PathsVariable.Identifier, identifier.identifier)}`;
      const url: string = `${config.PAGERDUTY.URL}${path}`;
      var configMethod = this.headersFrom;

      return axios.get(url, configMethod)
         .then((response: AxiosResponse<any>) => response.data);
   }
}
