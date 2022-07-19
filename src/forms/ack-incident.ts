import {
   AppCallRequest,
   AppCallValues,
   Incident,
   Oauth2App,
   UpdateIncident,
} from '../types';
import {  ExceptionType,  Routes,  } from '../constant';
import {  replace, tryPromiseForGenerateMessage } from '../utils/utils';
import { api, APIResponse, PartialCall } from '@pagerduty/pdjs/build/src/api';

export async function ackAlertAction(call: AppCallRequest): Promise<string> {
   let message: string;
   const oauth2: Oauth2App | undefined = call.context.oauth2;
   const incident: AppCallValues | undefined = call.state.incident;
   const incidentId: string = incident?.id;
   
   try {
      const pdClient: PartialCall = api({ token: oauth2.user?.token, tokenType: 'bearer' });
      const responseSubscriptions: APIResponse = await tryPromiseForGenerateMessage(
         pdClient.get(
            replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
         ),
         ExceptionType.MARKDOWN,
         'PagerDuty webhook failed'
      );

      const incident: Incident = responseSubscriptions.data['incident'];
   
      if (incident.status === 'acknowledged') {
         throw new Error(`You already have acknowledged "${incident.summary}"`);
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
         'PagerDuty incident update failed'
      );

      message = `You have acknowledged incident "${incident.summary}"`;
   } catch (error: any) {
      message = error.message;
   }

   return message;
}
