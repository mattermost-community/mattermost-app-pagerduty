import { api, APIResponse, PartialCall } from "@pagerduty/pdjs/build/src/api";
import { AppExpandLevels, AppFieldTypes, ChangeIncidentPriorityForm, ExceptionType, PagerDutyIcon, ReassignIncidentForm, Routes } from "../constant";
import { AppCallRequest, AppCallValues, AppField, AppForm, AppSelectOption, Incident, Oauth2App, PagerDutyOpts, Priority, UpdateIncident, UserResponse } from "../types";
import { replace, tryPromiseForGenerateMessage } from "../utils/utils";
import { getPrioritiesOptionList, getUsersOptionList } from "./pagerduty-options";

export async function changeIncidentPriorityActionForm(call: AppCallRequest): Promise<AppForm> {
   const oauth2: Oauth2App | undefined = call.context.oauth2;
   const tokenOpts: PagerDutyOpts = { token: <string>oauth2.user?.token, tokenType: 'bearer' };

   const incidentValues: AppCallValues | undefined = call.state.incident;
   const incidentId: string = incidentValues?.id;
   
   const pdClient: PartialCall = api(tokenOpts);

   const responseIncident: APIResponse = await tryPromiseForGenerateMessage(
      pdClient.get(
         replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
      ),
      ExceptionType.MARKDOWN,
      'PagerDuty get incident failed'
   );
   const incident: Incident = responseIncident.data['incident'];

   const prioritiesOpts: AppSelectOption[] = await getPrioritiesOptionList(tokenOpts);
   const fields: AppField[] = [
      {
         modal_label: 'Priorities',
         type: AppFieldTypes.STATIC_SELECT,
         name: ChangeIncidentPriorityForm.PRIORITY,
         is_required: true, 
         options: prioritiesOpts,
      },
   ];

   return {
      title: 'Change incident priority',
      header: `Choose a new priority level to the incident "${incident.summary}":`,
      icon: PagerDutyIcon,
      fields: fields,
      submit: {
         path: `${Routes.App.CallPathChangeIncidentPrioritySubmit}`,
         expand: {
            app: AppExpandLevels.EXPAND_SUMMARY,
            oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
            oauth2_user: AppExpandLevels.EXPAND_SUMMARY
         },
         state: call.state
      }
   } as AppForm;
}

export async function changeIncidentPrioritySubmitForm(call: AppCallRequest): Promise<string> {
   const oauth2: Oauth2App | undefined = call.context.oauth2;
   const tokenOpts: PagerDutyOpts = { token: <string>oauth2.user?.token, tokenType: 'bearer' };

   const incidentValues: AppCallValues | undefined = call.state.incident;
   const incidentId: string = incidentValues?.id;

   const values: AppCallValues | undefined = call.values;
   const assignTo: AppSelectOption = values?.[ChangeIncidentPriorityForm.PRIORITY];
   const pdClient: PartialCall = api(tokenOpts);

   const responseIncident: APIResponse = await tryPromiseForGenerateMessage(
      pdClient.get(
         replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
      ),
      ExceptionType.MARKDOWN,
      'PagerDuty get incident failed'
   );
   const incident: Incident = responseIncident.data['incident'];

   const responsePriority: APIResponse = await tryPromiseForGenerateMessage(
      pdClient.get(
         replace(Routes.PagerDuty.PriorityPathPrefix, Routes.PathsVariable.Identifier, assignTo.value)
      ),
      ExceptionType.MARKDOWN,
      'PagerDuty get priority failed'
   );
   const priority: Priority = responsePriority.data['priority'];

   const data: UpdateIncident = {
      incident: {
         type: 'incident',
         priority: priority
      }
   };

   await tryPromiseForGenerateMessage(
      pdClient.put(
         replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId),
         { data }
      ),
      ExceptionType.MARKDOWN,
      'PagerDuty incident update failed'
   );
   return `You have updated incident "${incident.summary}" priority to ${priority.name}`;
}
