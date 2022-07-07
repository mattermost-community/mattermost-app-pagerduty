import { KVStoreClient, KVStoreOptions, KVStoreProps } from "../clients/kvstore";
import { PagerDutyClient, PagerDutyOptions } from "../clients/pagerduty";
import config from "../config";
import { ExceptionType, StoreKeys } from "../constant";
import { AppCallDialog, AppContextAction, Identifier, IdentifierType, Incident, PostIncidentNote } from "../types";
import { tryPromiseForGenerateMessage } from "../utils/utils";

export async function addNoteToAlertAction(call: AppCallDialog<{ incident_message: string }>): Promise<any> {
   const context: AppContextAction = JSON.parse(call.state);
   const incidentMessage: string = call.submission.incident_message;
   const incidentId: string = context.incident.id;
   const oauthToken = config.PAGERDUTY.TOKEN;

   const pdOpt: PagerDutyOptions = {
      api_token: oauthToken,
      user_email: 'lizeth.garcia@ancient.mx'
   }
   const pagerDutyClient: PagerDutyClient = new PagerDutyClient(pdOpt);

   const identifier: Identifier = {
      identifier: incidentId,
      identifierType: IdentifierType.ID
   };

   const resIncident: { incident: Incident } = await tryPromiseForGenerateMessage(pagerDutyClient.getIncidentByID(identifier), ExceptionType.MARKDOWN, 'PagerDuty failed');

   const data: PostIncidentNote = {
      note: {
         content: incidentMessage
      }
   };
   await tryPromiseForGenerateMessage(pagerDutyClient.postNewIncidentNote(identifier, data), ExceptionType.MARKDOWN, 'PagerDuty failed');
   return resIncident.incident;
}
