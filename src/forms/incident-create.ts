import { KVStoreProps, KVStoreClient, KVStoreOptions } from "../clients/kvstore";
import { PagerDutyClient, PagerDutyOptions } from "../clients/pagerduty";
import { AppFieldTypes, Routes, PagerDutyIcon, StoreKeys, CreateIncidentForm, CreateIncidentFormModalType, CreateIncidentFormCommandType, PDFailed } from "../constant";
import { AppCallRequest, AppField, AppForm, AppSelectOption } from "../types";
import { getServiceOptionList, getUsersOptionList } from "./pagerduty-options";
import config from '../config';
import { PostIncident } from "../types/pagerduty";
import { tryPromisePagerdutyWithMessage } from "../utils/utils";

export async function createIncidentFormModal(call: AppCallRequest): Promise<AppForm> {
   const oauthToken = config.PAGERDUTY.TOKEN;
   const pdOpt: PagerDutyOptions = {
      api_token: oauthToken,
      user_email: 'lizeth.garcia@ancient.mx'
   }
   
   const serviceOpts: AppSelectOption[] = await getServiceOptionList(pdOpt);
   const assignToOpts: AppSelectOption[] = await getUsersOptionList(pdOpt);

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
         }
      }
   } as AppForm;
}

export async function addIncidentFromCommand(call: AppCallRequest) {
   const values = call.values as CreateIncidentFormCommandType;
   const oauthToken = config.PAGERDUTY.TOKEN;
   const pdOpt: PagerDutyOptions = {
      api_token: oauthToken,
      user_email: 'lizeth.garcia@ancient.mx'
   }
   const serviceOpts: AppSelectOption[] = await getServiceOptionList(pdOpt);
   const assignToOpts: AppSelectOption[] = await getUsersOptionList(pdOpt);

   const service = serviceOpts.find((b) => b.label == values.incident_impacted_service);
   const assign = assignToOpts.find((b) => b.label == values.incident_assign_to);

   if (!values?.incident_impacted_service && !values?.incident_title) {
      throw new Error("Required data not sended [Impacted service and title]");
   }


   const valuesData: CreateIncidentFormModalType = {
      incident_impacted_service: <AppSelectOption>service,
      incident_title: values.incident_title,
      incident_description: values.incident_description,
      incident_assign_to: <AppSelectOption>assign
   } 
   await postIncidentMethod(valuesData, pdOpt);
}


export async function submitCreateIncident(call: AppCallRequest): Promise<any> {
   const values = call.values as CreateIncidentFormModalType;
   const oauthToken = config.PAGERDUTY.TOKEN;
   const pdOpt: PagerDutyOptions = {
      api_token: oauthToken,
      user_email: 'lizeth.garcia@ancient.mx'
   }

   if (!values?.incident_impacted_service && !values?.incident_title) {
      throw new Error("Required data not sended [Impacted service and title]");
   }

   await postIncidentMethod(values, pdOpt);
}


async function postIncidentMethod(values: CreateIncidentFormModalType, pdOpt: PagerDutyOptions) {
   const pagerDutyClient: PagerDutyClient = new PagerDutyClient(pdOpt);

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

   await tryPromisePagerdutyWithMessage(pagerDutyClient.postNewIncident(incident), PDFailed);
}