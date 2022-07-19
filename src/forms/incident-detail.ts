import { api, APIResponse, PartialCall } from "@pagerduty/pdjs/build/src/api";
import { MattermostClient, MattermostOptions } from "../clients/mattermost";
import { ExceptionType, Routes } from "../constant";
import { AppAttachmentField, AppCallRequest, AppCallValues, AppField, Incident, Oauth2App, PostEphemeralCreate } from "../types";
import { h6, hyperlink } from "../utils/markdown";
import { replace, tryPromiseForGenerateMessage } from "../utils/utils";


export async function showIncidentDetailPost(call: AppCallRequest): Promise<any> {
   const oauth2: Oauth2App | undefined = call.context.oauth2;
   const incidentValues: AppCallValues | undefined = call.state.incident;
   const incidentId: string = incidentValues?.id;

   const pdClient: PartialCall = api({ token: oauth2.user?.token, tokenType: 'bearer' });

   const responseIncident: APIResponse = await tryPromiseForGenerateMessage(
      pdClient.get(
         replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
      ),
      ExceptionType.MARKDOWN,
      'PagerDuty get incident failed'
   );

   const incident: Incident = responseIncident.data['incident'];
   
   const mattermostUrl: string | undefined = call.context.mattermost_site_url;
   const botAccessToken: string | undefined = call.context.bot_access_token;
   const channelId: string | undefined = call.context.post?.channel_id;

   const fields: AppAttachmentField[] = [
      {
         short: false,
         title: 'Description',
         value: `${incident.description}`,
      },
      {
         short: true,
         title: 'Service',
         value: h6(`${hyperlink(`${incident.service.summary}`, incident.service.html_url)}`),
      },
      {
         short: true,
         title: 'Escalation Policy',
         value: h6(`${hyperlink(`${incident.escalation_policy.summary}`, incident.escalation_policy.html_url)}`),
      }
   ]

   const priority = incident?.priority;
   if (!!priority) {
      fields.push(
         {
            short: true,
            title: 'Priority',
            value: `${priority.summary} (${`${incident.urgency}`.toUpperCase()})`,
         }
      );
   } else {
      fields.push(
         {
            short: true,   
            title: 'Urgency',
            value: `${incident.urgency}`.toUpperCase(),
         }
      );
   }

   const assignee = incident?.assignments[0]?.assignee;
   if (!!assignee) {
      fields.push(
         {
            short: true,
            title: 'Assignee',
            value: h6(`${hyperlink(`${assignee.summary}`, assignee.html_url)}`),
         }
      );
   }

   let post: any = {
      user_id: <string>call.context.acting_user?.id,
      post: {
         message: "",
         channel_id: <string>channelId,
         props: {
            attachments: [
               {
                  title: h6(`Incident: ${hyperlink(`${incident.summary}`, incident.html_url)}`),
                  title_link: '',
                  fields: fields
               }
            ]
         }
      }
   }

   const mattermostOptions: MattermostOptions = {
      mattermostUrl: <string>mattermostUrl,
      accessToken: <string>botAccessToken
   };
   const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
   
   await mattermostClient.createEphemeralPost(post);
}