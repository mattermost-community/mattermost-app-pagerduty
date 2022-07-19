import { Request, Response } from 'express';
import {
   CallResponseHandler,
   newErrorCallResponseWithMessage,
   newFormCallResponse,
   newOKCallResponse,
   newOKCallResponseWithMarkdown
} from '../utils/call-responses';
import { getAllIncidentsCall } from '../forms/list-incident';
import {
   AppCallRequest,
   AppCallResponse,
   Incident,
} from '../types';
import { addIncidentFromCommand, createIncidentFormModal, submitCreateIncident } from '../forms/incident-create';
import { CreateIncidentFormCommandType } from '../constant';
import { h6, hyperlink, joinLines } from '../utils/markdown';
import { showMessageToMattermost } from '../utils/utils';
import { addNoteOpenModal, addNoteSubmitDialog } from '../forms/add-note-incident';
import { deletePostCall } from '../forms/delete-post';
import { confirmResolveOpenModal, callResolveIncidentSubmit } from '../forms/resolve-incident';
import { ackAlertAction } from '../forms/ack-incident';
import { reassignIncidentActionForm, reassignIncidentSubmitForm } from '../forms/reassign-incident';
import { showIncidentDetailPost } from '../forms/incident-detail';
import { changeIncidentPriorityActionForm, changeIncidentPrioritySubmitForm } from '../forms/change-incident-priority';


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
      callResponse = showMessageToMattermost(error);
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
   let callResponse: AppCallResponse;

   try {
      const message = await ackAlertAction(request.body);
      callResponse = newOKCallResponseWithMarkdown(message);
   } catch (error: any) {
      callResponse = showMessageToMattermost(error);
   }
   response.json(callResponse);
};

export const resolveIncidentModal = async (request: Request, response: Response) => {
   let callResponse: AppCallResponse = newOKCallResponse();

   try {
      const form = await confirmResolveOpenModal(request.body);
      callResponse = newFormCallResponse(form);
   } catch (error: any) {
      callResponse = showMessageToMattermost(error);
   }

   response.json(callResponse);
};

export const resolveIncidentSubmit = async (request: Request, response: Response) => {
   let callResponse: AppCallResponse = newOKCallResponse();

   try {
      const message = await callResolveIncidentSubmit(request.body);
      callResponse = newOKCallResponseWithMarkdown(message);
   } catch (error: any) {
      callResponse = showMessageToMattermost(error);
   }

   response.json(callResponse);
};

export const showIncidentDetail = async (request: Request, response: Response) => {
   let callResponse: AppCallResponse;

   try {
      await showIncidentDetailPost(request.body);
      callResponse = newOKCallResponse();
   } catch (error: any) {
      callResponse = showMessageToMattermost(error);
   }
   response.json(callResponse);
};

export const addNoteToIncidentModal = async (request: Request, response: Response) => {
   let callResponse: AppCallResponse;

   try {
      const form = await addNoteOpenModal(request.body);
      callResponse = newFormCallResponse(form);
   } catch (error: any) {
      callResponse = showMessageToMattermost(error);
   }
   response.json(callResponse);
};

export const addNoteToIncidentSubmit = async (request: Request, response: Response) => {
   let callResponse: AppCallResponse;

   try {
      const message = await addNoteSubmitDialog(request.body);
      callResponse = newOKCallResponseWithMarkdown(message);
   } catch (error: any) {
      callResponse = showMessageToMattermost(error);
   }

   response.json(callResponse);
};

export const closePostActions = async (request: Request, response: Response) => {
   let callResponse: AppCallResponse = newOKCallResponse();

   try {
      await deletePostCall(request.body);
   } catch (error: any) {
      callResponse = showMessageToMattermost(error);
   }

   response.json(callResponse);
};

export const reassignIncidentModal = async (request: Request, response: Response) => {
   let callResponse: AppCallResponse;

   try {
      const form = await reassignIncidentActionForm(request.body);
      callResponse = newFormCallResponse(form);
   } catch (error: any) {
      callResponse = showMessageToMattermost(error);
   }
   response.json(callResponse);
};

export const reassignIncidentSubmit = async (request: Request, response: Response) => {
   let callResponse: AppCallResponse;

   try {
      const message = await reassignIncidentSubmitForm(request.body);
      callResponse = newOKCallResponseWithMarkdown(message);
   } catch (error: any) {
      callResponse = showMessageToMattermost(error);
   }

   response.json(callResponse);
};

export const changePriorityIncidentModal = async (request: Request, response: Response) => {
   let callResponse: AppCallResponse;

   try {
      const form = await changeIncidentPriorityActionForm(request.body);
      callResponse = newFormCallResponse(form);
   } catch (error: any) {
      callResponse = showMessageToMattermost(error);
   }
   response.json(callResponse);
};

export const changePriorityIncidentSubmit = async (request: Request, response: Response) => {
   let callResponse: AppCallResponse;

   try {
      const message = await changeIncidentPrioritySubmitForm(request.body);
      callResponse = newOKCallResponseWithMarkdown(message);
   } catch (error: any) {
      callResponse = showMessageToMattermost(error);
   }

   response.json(callResponse);
};
