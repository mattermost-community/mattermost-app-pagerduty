import { MattermostClient, MattermostOptions } from "../clients/mattermost";
import { AppExpandLevels, ExceptionType, PagerDutyIcon, Routes } from "../constant";
import { 
   AppCallRequest, 
   AppCallValues, 
   AppForm, 
   Incident, 
   Oauth2App, 
   PagerDutyOpts, 
   PostUpdate, 
   UpdateIncident 
} from "../types";
import { replace, tryPromiseForGenerateMessage } from "../utils/utils";
import * as _ from 'lodash';
import { api, APIResponse, PartialCall } from "@pagerduty/pdjs/build/src/api";
import { Exception } from "../utils/exception";
import { h6, hyperlink } from "../utils/markdown";

export async function confirmResolveOpenModal(call: AppCallRequest): Promise<AppForm> {
   const oauth2: Oauth2App | undefined = call.context.oauth2;
   const tokenOpts: PagerDutyOpts = { token: <string>oauth2.user?.token, tokenType: 'bearer' };
   const pdClient: PartialCall = api(tokenOpts);
   const incidentValues: AppCallValues | undefined = call.state.incident;
   const incidentId: string = incidentValues?.id;
   const postId: string = <string>call.context.post?.id;

   const responseIncident: APIResponse = await tryPromiseForGenerateMessage(
      pdClient.get(
         replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
      ),
      ExceptionType.MARKDOWN,
      'PagerDuty get incident failed'
   );
   const incident: Incident = responseIncident.data['incident'];
   if (incident.status === 'resolved') {
      await updatePostResolveIncident(call, postId, incident);
      throw new Exception(ExceptionType.MARKDOWN, `"PagerDuty incident update failed". You already have resolved incident "${incident.summary}"`)
   }

   return {
      title: 'Resolve incident',
      header: `Are you sure you want to resolve incident "${incident.summary}"?`,
      icon: PagerDutyIcon,
      fields: [],
      submit: {
         path: `${Routes.App.CallPathIncidentResolveSubmit}`,
         expand: {
            app: AppExpandLevels.EXPAND_SUMMARY,
            oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
            oauth2_user: AppExpandLevels.EXPAND_SUMMARY
         },
         state: {
            ...call.state,
            post: call.context.post
         }
      }
   } as AppForm;
}

export async function callResolveIncidentSubmit(call: AppCallRequest): Promise<string> {
   const oauth2: Oauth2App | undefined = call.context.oauth2;
   const incidentValues: AppCallValues | undefined = call.state.incident;
   const incidentId: string = incidentValues?.id;
   const postId: string = <string>call.state.post?.id;

   const pdClient: PartialCall = api({ token: oauth2.user?.token, tokenType: 'bearer' });

   const responseIncident: APIResponse = await tryPromiseForGenerateMessage(
      pdClient.get(
         replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
      ),
      ExceptionType.MARKDOWN,
      'PagerDuty get incident failed'
   );

   const incident: Incident = responseIncident.data['incident'];
  
   if (incident.status === 'resolved') {
      await updatePostResolveIncident(call, postId, incident);
      throw new Exception(ExceptionType.MARKDOWN, `"PagerDuty incident update failed". You already have resolved incident "${incident.summary}"`)
   }

   const data: UpdateIncident = {
      incident: {
         type: 'incident_reference',
         status: 'resolved'
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

   await updatePostResolveIncident(call, postId, incident);
   return `You have succesfully resolved incident "${incident.summary}"!`;

}

async function updatePostResolveIncident(call: AppCallRequest, postId: string, incident: Incident) {
   const mattermostUrl: string | undefined = call.context.mattermost_site_url;
   const botAccessToken: string | undefined = call.context.bot_access_token;

   const mattermostOptions: MattermostOptions = {
      mattermostUrl: <string>mattermostUrl,
      accessToken: <string>botAccessToken
   };

   const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
   await tryPromiseForGenerateMessage(mattermostClient.getPost(postId), ExceptionType.MARKDOWN, 'Mattermost failed');

   const updatePost: PostUpdate = {
      id: postId,
      props: {
         attachments: [
            {
               title: h6(`Triggered: ${hyperlink(`${incident.summary}`, incident.html_url)}`), 
               title_link: '',
               color: "#AD251C",
               fields: [
                  {
                     short: true,
                     title: 'Status',
                     value: 'Resolved'
                  },
                  {
                     short: true,
                     title: 'Escalation policy',
                     value: `${incident.escalation_policy.summary}`
                  }
               ]
            }

         ]
      }
   }
   await mattermostClient.updatePost(<string>postId, updatePost);
}
