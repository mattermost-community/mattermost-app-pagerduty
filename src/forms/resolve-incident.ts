import { MattermostClient, MattermostOptions } from "../clients/mattermost";
import { PagerDutyClient, PagerDutyOptions } from "../clients/pagerduty";
import config from "../config";
import { ExceptionType, PDFailed } from "../constant";
import { AppCallAction, AppCallValues, AppContextAction, Identifier, IdentifierType, Incident, PostUpdate, UpdateIncident } from "../types";
import { tryPromiseForGenerateMessage } from "../utils/utils";
import * as _ from 'lodash';

export async function closeIncidentAction(call: AppCallAction<AppContextAction>): Promise<void> {
   const mattermostUrl: string | undefined = call.context.mattermost_site_url;
   const botAccessToken: string | undefined = call.context.bot_access_token;
   const incident: AppCallValues | undefined = call.context.incident;
   const postId: string = call.post_id;

   const mattermostOptions: MattermostOptions = {
      mattermostUrl: <string>mattermostUrl,
      accessToken: <string>botAccessToken
   };
   const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

   const incidentId: string = incident?.id;

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
   const resIncident: { incident: Incident } = await tryPromiseForGenerateMessage(pagerDutyClient.getIncidentByID(identifier), ExceptionType.MARKDOWN, PDFailed);


   if (resIncident.incident.status === 'closed') {
      await updatePostResolveIncident(mattermostClient, postId);
      throw new Error(`You have resolved #${incidentId}`);
   }

   const data: UpdateIncident = {
      incident: {
         type: 'incident_reference',
         status: 'resolved'
      }
   }
   await tryPromiseForGenerateMessage(pagerDutyClient.updateIncidentByID(identifier, data), ExceptionType.MARKDOWN, PDFailed);
   await updatePostResolveIncident(mattermostClient, postId);
}

async function updatePostResolveIncident(mattermostClient: MattermostClient, postId: string) {
   const currentPost = await tryPromiseForGenerateMessage(mattermostClient.getPost(postId), ExceptionType.MARKDOWN, 'Mattermost failed');

   const newProps = _.cloneDeep(currentPost.props);
   newProps.attachments[0].actions = [];
   newProps.attachments[0].color = "#AD251C";
   const updatePost: PostUpdate = {
      id: postId,
      props: newProps
   }
   await mattermostClient.updatePost(postId, updatePost);
}