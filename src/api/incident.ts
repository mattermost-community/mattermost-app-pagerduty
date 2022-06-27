import {
    CallResponseHandler,
    newErrorCallResponseWithMessage,
    newOKCallResponseWithMarkdown
} from "../utils/call-responses";
import {Request, Response} from "express";
import {AppCallResponse, Incident} from "../types";
import {getAllIncidentsCall} from '../forms/list-incident';
import {h6, hyperlink, joinLines} from '../utils/markdown';

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

