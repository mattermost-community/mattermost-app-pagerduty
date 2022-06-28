import { Request, Response } from 'express';
import {
   CallResponseHandler,
   newErrorCallResponseWithMessage,
   newFormCallResponse,
   newOKCallResponseWithMarkdown
} from '../utils/call-responses';
import { getAllIncidentsCall } from '../forms/list-incident';
import { AppCallRequest, AppCallResponse, Incident } from '../types';
import { addIncidentFromCommand, createIncidentFormModal, submitCreateIncident } from '../forms/incident-create';
import { CreateIncidentFormCommandType, CreateIncidentFormModalType } from '../constant';
import { h6, hyperlink, joinLines } from '../utils/markdown';


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
