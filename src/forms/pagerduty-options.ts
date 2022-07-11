import { PagerDutyClient, PagerDutyOptions } from "../clients/pagerduty";
import { AppSelectOption } from "../types";

export async function getServiceOptionList(pdOpt: PagerDutyOptions): Promise<AppSelectOption[]> {
   const pagerDutyClient: PagerDutyClient = new PagerDutyClient(pdOpt);
   const response = await pagerDutyClient.getServices();
   const services = response?.services;
   if (!!services){
      const options: AppSelectOption[] = [...services.map((b: any) => { return { label: b.name, value: b.id } })];
      return options;
   }
   
   return [];
}

export async function getUsersOptionList(pdOpt: PagerDutyOptions): Promise<AppSelectOption[]> {
   const pagerDutyClient: PagerDutyClient = new PagerDutyClient(pdOpt);
   const response = await pagerDutyClient.getUsers();
   const users = response?.users;
   if (!!users) {
      const options: AppSelectOption[] = [...users.map((b: any) => { return { label: b.email, value: b.id } })];
      return options;
   }

   return [];
}