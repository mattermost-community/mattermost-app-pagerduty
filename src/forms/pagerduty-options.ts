import { api } from "@pagerduty/pdjs";
import { APIResponse, PartialCall } from "@pagerduty/pdjs/build/src/api";
import { ExceptionType, Routes } from "../constant";
import { AppSelectOption, PagerDutyOpts, Priority, Service } from "../types";
import { tryPromiseForGenerateMessage } from "../utils/utils";

export async function getServiceOptionList(pdOpt: PagerDutyOpts): Promise<AppSelectOption[]> {
   const pdClient: PartialCall = api({ token: pdOpt.token, tokenType: pdOpt.tokenType });
   const responseServices: APIResponse = await tryPromiseForGenerateMessage(
      pdClient.get(Routes.PagerDuty.ServicesPathPrefix),
      ExceptionType.MARKDOWN,
      'PagerDuty service failed'
   );
   const services: Service[] = responseServices?.data['services'];
   if (!!services){
      const options: AppSelectOption[] = [...services.map((b: any) => { return { label: b.name, value: b.id } })];
      return options;
   }
   
   return [];
}

export async function getUsersOptionList(pdOpt: PagerDutyOpts): Promise<AppSelectOption[]> {
   const pdClient: PartialCall = api({ token: pdOpt.token, tokenType: pdOpt.tokenType });
   const responseServices: APIResponse = await tryPromiseForGenerateMessage(
      pdClient.get(Routes.PagerDuty.UsersPathPrefix),
      ExceptionType.MARKDOWN,
      'PagerDuty get users failed'
   );

   const users: Service[] = responseServices?.data['users'];
   if (!!users) {
      const options: AppSelectOption[] = [...users.map((b: any) => { return { label: b.email, value: b.id } })];
      return options;
   }

   return [];
}

export async function getPrioritiesOptionList(pdOpt: PagerDutyOpts): Promise<AppSelectOption[]> {
   const pdClient: PartialCall = api({ token: pdOpt.token, tokenType: pdOpt.tokenType });
   const responseServices: APIResponse = await tryPromiseForGenerateMessage(
      pdClient.get(Routes.PagerDuty.PrioritiesPathPrefix),
      ExceptionType.MARKDOWN,
      'PagerDuty get priorities failed'
   );

   const priorities: Priority[] = responseServices?.data['priorities'];
   if (!!priorities) {
      const options: AppSelectOption[] = [...priorities.map((b: Priority) => { return { label: b.name, value: b.id } })];
      return options;
   }

   return [];
}