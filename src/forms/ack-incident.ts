import {
   AppCallRequest,
   AppCallValues,
   Incident,
   Oauth2App,
   UpdateIncident,
} from '../types';
import {  ExceptionType,  Routes,  } from '../constant';
import {configureI18n} from "../utils/translations";
import {  replace, tryPromiseForGenerateMessage } from '../utils/utils';
import { api, APIResponse, PartialCall } from '@pagerduty/pdjs/build/src/api';

export async function ackAlertAction(call: AppCallRequest): Promise<string> {
   let message: string;
   const oauth2: Oauth2App | undefined = call.context.oauth2;
   const incident: AppCallValues | undefined = call.state.incident;
   const incidentId: string = incident?.id;
   const i18nObj = configureI18n(call.context);
   
   try {
      const pdClient: PartialCall = api({ token: oauth2.user?.token, tokenType: 'bearer' });
      const responseSubscriptions: APIResponse = await tryPromiseForGenerateMessage(
         pdClient.get(
            replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
         ),
         ExceptionType.MARKDOWN,
         i18nObj.__('forms.incident.exception')
      );

      const incident: Incident = responseSubscriptions.data['incident'];
   
      if (incident.status === 'acknowledged') {
         throw new Error(i18nObj.__('forms.incident.error', { summary: incident.summary }));
      }
      
      const data: UpdateIncident = {
         incident: {
            type: 'incident',
            status: 'acknowledged'
         }
      }

      await tryPromiseForGenerateMessage(
         pdClient.put(
            replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId),
            { data }
         ),
         ExceptionType.MARKDOWN,
         i18nObj.__('forms.incident.exception_update')
      );

      message = i18nObj.__('forms.incident.message', { summary: incident.summary });
   } catch (error: any) {
      message = error.message;
   }

   return message;
}
