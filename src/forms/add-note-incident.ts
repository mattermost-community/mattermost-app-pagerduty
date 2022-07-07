import { KVStoreClient, KVStoreOptions, KVStoreProps } from "../clients/kvstore";
import { PagerDutyClient, PagerDutyOptions } from "../clients/pagerduty";
import config from "../config";
import { ExceptionType, StoreKeys } from "../constant";
import { AppCallDialog, AppContextAction, Identifier, IdentifierType } from "../types";
import { tryPromiseForGenerateMessage } from "../utils/utils";

export async function addNoteToAlertAction(call: AppCallDialog<{ alert_message: string }>): Promise<any> {
   const context: AppContextAction = JSON.parse(call.state);
   const mattermostUrl: string | undefined = context.mattermost_site_url;
   const botAccessToken: string | undefined = context.bot_access_token;

   const alertMessage: string = call.submission.alert_message;
   const incidentId: string = context.incident.id;

   const options: KVStoreOptions = {
      mattermostUrl: <string>mattermostUrl,
      accessToken: <string>botAccessToken,
   };
   const kvStoreClient = new KVStoreClient(options);

   const kvConfig: KVStoreProps = await kvStoreClient.kvGet(StoreKeys.config);
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

   const resIncident: any = await tryPromiseForGenerateMessage(pagerDutyClient.getIncidentByID(identifier), ExceptionType.MARKDOWN, 'PagerDuty failed');

   const data: any = {
      note: alertMessage
   };
   const responseAlert: any = await tryPromiseForGenerateMessage(pagerDutyClient.postNewIncidentNote(identifier, {}), ExceptionType.MARKDOWN, 'PagerDuty failed');
   return resIncident.data;
}
