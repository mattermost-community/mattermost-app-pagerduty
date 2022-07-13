import { PagerDutyClient, PagerDutyOptions } from "../clients/pagerduty";
import config from "../config";
import { ExceptionType, PDFailed } from "../constant";
import { AppCallAction, AppCallDialog, AppContextAction, Identifier, IdentifierType, Incident, PostIncidentNote, UpdateIncident } from "../types";
import { tryPromiseForGenerateMessage } from "../utils/utils";

export async function reassignIncidentAction(call: AppCallAction<AppContextAction>): Promise<string> {
   const context: AppContextAction = call.context;
   const selectedOpt: string = <string>context.selected_option;
   const incidentId: string = context.incident.id;

   const pdOpt: PagerDutyOptions = {
      api_token: '',
      user_email: 'lizeth.garcia@ancient.mx'
   }
   const pagerDutyClient: PagerDutyClient = new PagerDutyClient(pdOpt);

   const identifier: Identifier = {
      identifier: incidentId,
      identifierType: IdentifierType.ID
   };

   const userIdentifier: Identifier = {
      identifier: selectedOpt,
      identifierType: IdentifierType.ID
   };
   
   const user: { user: any } = await tryPromiseForGenerateMessage(pagerDutyClient.getUserByID(userIdentifier), ExceptionType.MARKDOWN, PDFailed);

   const data: UpdateIncident = {
      incident: {
         type: 'incident',
         assignments: [
            {
               assignee: {
                  id: selectedOpt,
                  type: 'user'
               }
            }
         ]
      }
   };
   await tryPromiseForGenerateMessage(pagerDutyClient.updateIncidentByID(identifier, data), ExceptionType.MARKDOWN, PDFailed);
   return `You have reassigned incident #${incidentId} to ${user?.user?.name}`;
}
