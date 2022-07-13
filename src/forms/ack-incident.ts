import {
   AppCallAction,
   AppCallValues,
   AppContextAction,
   Identifier,
   IdentifierType,
   Incident,
   UpdateIncident,
} from '../types';
import {  ExceptionType,  PDFailed,  } from '../constant';
import {  KVStoreOptions } from '../clients/kvstore';
import {  tryPromiseForGenerateMessage } from '../utils/utils';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import config from '../config';
import { PagerDutyClient, PagerDutyOptions } from '../clients/pagerduty';

export async function ackAlertAction(call: AppCallAction<AppContextAction>): Promise<string> {
   let message: string;
   const mattermostUrl: string | undefined = call.context.mattermost_site_url;
   const botAccessToken: string | undefined = call.context.bot_access_token;
   const username: string | undefined = call.user_name;
   const incident: AppCallValues | undefined = call.context.incident;
   const channelId: string | undefined = call.channel_id;
   const incidentId: string = incident?.id;
   const postId: string = call.post_id;
   let acknowledged: boolean = false;
   const mattermostOptions: MattermostOptions = {
      mattermostUrl: <string>mattermostUrl,
      accessToken: <string>botAccessToken
   };
   const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

   try {
      const options: KVStoreOptions = {
         mattermostUrl: <string>mattermostUrl,
         accessToken: <string>botAccessToken,
      };

      const pdOpt: PagerDutyOptions = {
         api_token: '',
         user_email: 'lizeth.garcia@ancient.mx'
      }
      const pagerDutyClient: PagerDutyClient = new PagerDutyClient(pdOpt);

      const identifier: Identifier = {
         identifier: incidentId,
         identifierType: IdentifierType.ID
      };

      const resIncident: { incident: Incident } = await tryPromiseForGenerateMessage(pagerDutyClient.getIncidentByID(identifier), ExceptionType.MARKDOWN, PDFailed);

      if (resIncident.incident.status === 'acknowledged') {
         throw new Error(`You already have acknowledged #${incidentId}`);
      }
      
      const data: UpdateIncident = {
         incident: {
            type: 'incident',
            status: 'acknowledged'
         }
      }

      await tryPromiseForGenerateMessage(pagerDutyClient.updateIncidentByID(identifier, data), ExceptionType.MARKDOWN, PDFailed);

      message = `You have acknowledged #${incidentId}`;
   } catch (error: any) {
      acknowledged = true;
      message = 'Unexpected error: ' + error.message;
   }

   return message;
}
