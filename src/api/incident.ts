import { Request, Response } from 'express';
import {
   CallResponseHandler,
   newErrorCallResponseWithMessage,
   newFormCallResponse,
   newOKCallResponse,
   newOKCallResponseWithMarkdown
} from '../utils/call-responses';
import { getAllIncidentsCall } from '../forms/list-incident';
import { AppCallDialog, AppCallRequest, AppCallResponse, AppContextAction, Incident, PostEphemeralCreate } from '../types';
import { addIncidentFromCommand, createIncidentFormModal, submitCreateIncident } from '../forms/incident-create';
import { CreateIncidentFormCommandType, CreateIncidentFormModalType } from '../constant';
import { h6, hyperlink, joinLines } from '../utils/markdown';
import { showMessageToMattermost } from '../utils/utils';
import { otherActionsIncidentCall } from '../forms/other-actions-incident';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import { addNoteToAlertAction } from '../forms/add-note-incident';


export const listIncidentSubmit: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: AppCallResponse;

    try {
        const incidents: Incident[] = await getAllIncidentsCall(req.body);
        const servicesText: string = [
            getHeader(incidents.length),
            getIncidents(incidents)
        ].join('');
        callResponse = newOKCallResponseWithMarkdown(servicesText);
        res.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open configuration form: ' + error.message);
        res.json(callResponse);
    }
};

function getHeader(serviceLength: number): string {
    return h6(`Incident List: Found ${serviceLength} matching services.`);
}

function getIncidents(services: Incident[]): string {
    return `${joinLines(
        services.map((incident: Incident) => `- ${incident.summary} - ${hyperlink('View detail.', incident.html_url)}`).join('\n')
    )}\n`;
}

export const createNewIncident: CallResponseHandler = async (req: Request, res: Response) => {
   const call: AppCallRequest = req.body;
   let callResponse: AppCallResponse;
   const values = call.values as CreateIncidentFormCommandType;

   try {
      if (values?.incident_impacted_service && values?.incident_title) {
         await addIncidentFromCommand(call);
         callResponse = newOKCallResponseWithMarkdown('Incident created')
      } else {
         const form = await createIncidentFormModal(call);
         callResponse = newFormCallResponse(form);
      }
   } catch (error: any) {
      callResponse = newErrorCallResponseWithMessage('Unable to create a new incident' + error.message);
   }
   res.json(callResponse);
};

export const submitCreateNewIncident = async (req: Request, res: Response) => {
   const call: AppCallRequest = req.body;
   let callResponse: AppCallResponse;
   try {
      await submitCreateIncident(call);
      callResponse = newOKCallResponseWithMarkdown('Incident created')
   } catch (error: any) {
      callResponse = newErrorCallResponseWithMessage('Unable to create a new incident: ' + error.message);
   }
   res.json(callResponse);
}

export const ackIncidentAction = async (request: Request, response: Response) => {
   /*
   const call: AppCallAction<AppContextAction> = request.body;
   const mattermostUrl: string | undefined = call.context.mattermost_site_url;
   const botAccessToken: string | undefined = call.context.bot_access_token;
   const channelId: string | undefined = call.channel_id;
   let post: PostEphemeralCreate;

   const mattermostOptions: MattermostOptions = {
      mattermostUrl: <string>mattermostUrl,
      accessToken: <string>botAccessToken
   };
   const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
   console.log(call);
   try {
      const message = await ackAlertAction(request.body);
      post = {
         post: {
            message: message,
            channel_id: channelId,
         },
         user_id: call.user_id,
      };
   } catch (error: any) {
      post = {
         post: {
            message: 'Unexpected error: ' + error.message,
            channel_id: channelId,
         },
         user_id: call.user_id,
      };
   }

   await mattermostClient.createEphemeralPost(post);
   response.json();
   */
};

export const resolveIncidentAction = async (request: Request, response: Response) => {
   /*
   const call: AppCallAction<AppContextAction> = request.body;
   const mattermostUrl: string | undefined = call.context.mattermost_site_url;
   const botAccessToken: string | undefined = call.context.bot_access_token;
   const channelId: string | undefined = call.channel_id;
   let post: PostEphemeralCreate;

   const mattermostOptions: MattermostOptions = {
      mattermostUrl: <string>mattermostUrl,
      accessToken: <string>botAccessToken
   };
   const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
   console.log(call);
   try {
      const message = await ackAlertAction(request.body);
      post = {
         post: {
            message: message,
            channel_id: channelId,
         },
         user_id: call.user_id,
      };
   } catch (error: any) {
      post = {
         post: {
            message: 'Unexpected error: ' + error.message,
            channel_id: channelId,
         },
         user_id: call.user_id,
      };
   }

   await mattermostClient.createEphemeralPost(post);
   response.json();
   */
};

export const otherActionsIncident = async (request: Request, response: Response) => {
   let callResponse: AppCallResponse;

   try {
      await otherActionsIncidentCall(request.body);
      callResponse = newOKCallResponse();
      response.json(callResponse);
   } catch (error: any) {
      callResponse = showMessageToMattermost(error);
      response.json(callResponse);
   }
};

export const addNoteToIncidentModal = async (request: Request, response: Response) => {
   let callResponse: AppCallResponse;
   const call: AppCallDialog<{ incident_message: string }> = request.body;
   const context: AppContextAction = JSON.parse(call.state);
   const mattermostUrl: string | undefined = context.mattermost_site_url;
   const botAccessToken: string | undefined = context.bot_access_token;
   const channelId: string | undefined = call.channel_id;
   let message: string = '';

   const mattermostOptions: MattermostOptions = {
      mattermostUrl: <string>mattermostUrl,
      accessToken: <string>botAccessToken
   };
   const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

   try {
      const incident: Incident = await addNoteToAlertAction(request.body);
      message = `Note will be added for #${incident.id}`;
   } catch (error: any) {
      message = 'Unexpected error: ' + error.message;
   }

   const post: PostEphemeralCreate = {
      post: {
         message: message,
         channel_id: channelId,
      },
      user_id: call.user_id,
   };
   await mattermostClient.createEphemeralPost(post);
   response.json();
}
