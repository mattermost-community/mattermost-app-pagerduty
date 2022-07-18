import { api, APIResponse, PartialCall } from "@pagerduty/pdjs/build/src/api";
import { PagerDutyClient, PagerDutyOptions, PagerDutyOpts } from "../clients/pagerduty";
import { AppExpandLevels, AppFieldTypes, ExceptionType, NoteModalForm, PagerDutyIcon, PDFailed, ReassignIncidentForm, Routes } from "../constant";
import { AppCallAction, AppCallRequest, AppCallValues, AppContextAction, AppField, AppForm, AppSelectOption, Identifier, IdentifierType, Incident, Oauth2App, UpdateIncident, UserResponse } from "../types";
import { replace, tryPromiseForGenerateMessage } from "../utils/utils";
import { getUsersOptionList } from "./pagerduty-options";

export async function reassignIncidentActionForm(call: AppCallRequest): Promise<AppForm> {
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

   const assignToOpts: AppSelectOption[] = await getUsersOptionList(tokenOpts);
   const fields: AppField[] = [
      {
         modal_label: 'User',
         type: AppFieldTypes.STATIC_SELECT,
         name: ReassignIncidentForm.ASSIGN_TO,
         is_required: true, 
         options: assignToOpts,
      },
   ];

   return {
      title: 'Assign incident',
      header: `Choose a user to assign the incident "${incident.summary}" to:`,
      icon: PagerDutyIcon,
      fields: fields,
      submit: {
         path: `${Routes.App.CallPathAssignIncidentSubmit}`,
         expand: {
            app: AppExpandLevels.EXPAND_SUMMARY,
            oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
            oauth2_user: AppExpandLevels.EXPAND_SUMMARY
         },
         state: call.state
      }
   } as AppForm;
}

export async function reassignIncidentSubmitForm(call: AppCallRequest): Promise<string> {
   const oauth2: Oauth2App | undefined = call.context.oauth2;
   const tokenOpts: PagerDutyOpts = { token: <string>oauth2.user?.token, tokenType: 'bearer' };

   const incidentValues: AppCallValues | undefined = call.state.incident;
   const incidentId: string = incidentValues?.id;

   const values: AppCallValues | undefined = call.values;
   const assignTo: AppSelectOption = values?.[ReassignIncidentForm.ASSIGN_TO];
   const pdClient: PartialCall = api(tokenOpts);

   const responseIncident: APIResponse = await tryPromiseForGenerateMessage(
      pdClient.get(
         replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
      ),
      ExceptionType.MARKDOWN,
      'PagerDuty get incident failed'
   );
   const incident: Incident = responseIncident.data['incident'];

   const responseUser: APIResponse = await tryPromiseForGenerateMessage(
      pdClient.get(
         replace(Routes.PagerDuty.UserPathPrefix, Routes.PathsVariable.Identifier, assignTo.value)
      ),
      ExceptionType.MARKDOWN,
      'PagerDuty get user failed'
   );
   const user: UserResponse = responseUser.data['user'];

   const data: UpdateIncident = {
      incident: {
         type: 'incident',
         assignments: [
            {
               assignee: {
                  id: assignTo.value,
                  type: 'user'
               }
            }
         ]
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
   return `You have reassigned incident "${incident.summary}" to ${user?.name}`;
}
