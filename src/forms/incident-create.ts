import {
   AppFieldTypes,
   Routes,
   PagerDutyIcon,
   CreateIncidentForm,
   CreateIncidentFormModalType,
   CreateIncidentFormCommandType,
   ExceptionType,
   AppExpandLevels
} from "../constant";
import { AppCallRequest, AppField, AppForm, AppSelectOption, Oauth2App } from "../types";
import { getServiceOptionList, getUsersOptionList } from "./pagerduty-options";
import { PagerDutyOpts, PostIncident } from "../types/pagerduty";
import { tryPromiseForGenerateMessage, tryPromisePagerdutyWithMessage } from "../utils/utils";
import { api, PartialCall } from "@pagerduty/pdjs/build/src/api";

export async function createIncidentFormModal(call: AppCallRequest): Promise<AppForm> {
   const oauth2: Oauth2App | undefined = call.context.oauth2;
   const tokenOpts: PagerDutyOpts = { token: <string>oauth2.user?.token, tokenType: 'bearer' };
   
   const serviceOpts: AppSelectOption[] = await getServiceOptionList(tokenOpts);
   const assignToOpts: AppSelectOption[] = await getUsersOptionList(tokenOpts);

   const fields: AppField[] = [
      {
         type: AppFieldTypes.STATIC_SELECT,
         options: serviceOpts,
         name: CreateIncidentForm.SERVICE,
         modal_label: 'Impacted Service',
         description: 'Impacted service name',
         is_required: true,
      },
      {
         type: AppFieldTypes.TEXT,
         name: CreateIncidentForm.TITLE,
         modal_label: 'Title',
         description: 'Incident title',
         is_required: true
      },
      {
         type: AppFieldTypes.TEXT,
         name: CreateIncidentForm.DESCRIPTION,
         modal_label: 'Description (optional)',
         description: 'Incident description',
         is_required: false
      },
      {
         type: AppFieldTypes.STATIC_SELECT,
         options: assignToOpts,
         name: CreateIncidentForm.ASSIGN_TO,
         modal_label: 'Assign to (optional)',
         description: 'To whom this incident will be assigned',
         is_required: false,
      },
   ];

   return {
      title: 'Create New Incident',
      icon: PagerDutyIcon,
      fields: fields,
      submit: {
         path: `${Routes.App.CallPathForms}${Routes.App.CallPathIncidentCreate}${Routes.App.CallPathSubmit}`,
         expand: {
            app: AppExpandLevels.EXPAND_SUMMARY,
            oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
            oauth2_user: AppExpandLevels.EXPAND_SUMMARY
         }
      }
   } as AppForm;
}

export async function addIncidentFromCommand(call: AppCallRequest) {
   const values = call.values as CreateIncidentFormCommandType;

   if (!values?.incident_impacted_service && !values?.incident_title) {
      throw new Error("Required data not sended [Impacted service and title]");
   }

   const oauth2: Oauth2App | undefined = call?.context?.oauth2;
   const tokenOpts: PagerDutyOpts = { token: <string>oauth2.user?.token, tokenType: 'bearer' };

   const serviceOpts: AppSelectOption[] = await getServiceOptionList(tokenOpts);
   const assignToOpts: AppSelectOption[] = await getUsersOptionList(tokenOpts);

   const service = serviceOpts.find((b) => b.value == values.incident_impacted_service || b.label == values.incident_impacted_service );
   const assign = assignToOpts.find((b) => b.value == values.incident_assign_to || b.label == values.incident_assign_to );

   const valuesData: CreateIncidentFormModalType = {
      incident_impacted_service: <AppSelectOption>service,
      incident_title: values.incident_title,
      incident_description: values.incident_description,
      incident_assign_to: <AppSelectOption>assign
   } 

   await postIncidentMethod(valuesData, tokenOpts);
}

export async function submitCreateIncident(call: AppCallRequest): Promise<any> {
   const values = call.values as CreateIncidentFormModalType;

   const oauth2: Oauth2App | undefined = call?.context?.oauth2;
   const tokenOpts: PagerDutyOpts = { token: <string>oauth2.user?.token, tokenType: 'bearer' };

   if (!values?.incident_impacted_service && !values?.incident_title) {
      throw new Error("Required data not sended [Impacted service and title]");
   }

   await postIncidentMethod(values, tokenOpts);
}


async function postIncidentMethod(values: CreateIncidentFormModalType, pdOpt: PagerDutyOpts) {
   const pdClient: PartialCall = api({ token: pdOpt.token, tokenType: pdOpt.tokenType });

   const incident: PostIncident = {
      incident: {
         type: "incident",
         title: values.incident_title,
         service: {
            id: values.incident_impacted_service.value,
            type: "service_reference"
         }
      }
   }

   if (!!values.incident_description) {
      incident.incident.body = {
         type: "incident_body",
         details: values.incident_description
      }
   }

   if (!!values.incident_description) {
      incident.incident.body = {
         type: "incident_body",
         details: values.incident_description
      };
   }
   if (!!values.incident_assign_to) {
      incident.incident.assignments = [
         {
            assignee: {
               id: values.incident_assign_to.value,
               type: "user"
            }
         }
      ];
   }

   await tryPromiseForGenerateMessage(
      pdClient.post(Routes.PagerDuty.IncidentsPathPrefix, { data: incident }),
      ExceptionType.MARKDOWN,
      'PagerDuty service failed'
   );
}
