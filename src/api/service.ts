import {Request, Response} from 'express';
import {AppCallResponse, Service} from '../types';
import {
    newOKCallResponseWithMarkdown
} from '../utils/call-responses';
import {h6, joinLines} from '../utils/markdown';
import {showMessageToMattermost} from '../utils/utils';
import {getAllServicesCall} from '../forms/list-service';

export const listTeamsSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const services: Service[] = await getAllServicesCall(request.body);
        const servicesText: string = [
            getHeader(services.length),
            getServices(services)
        ].join('');
        callResponse = newOKCallResponseWithMarkdown(servicesText);
        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

function getHeader(serviceLength: number): string {
    return h6(`Service List: Found ${serviceLength} matching services.`);
}

function getServices(services: Service[]): string {
    return `${joinLines(
        services.map((service: Service) => `- Service ID "${service.id}" - Service Name "${service.name}"`).join('\n')
    )}\n`;
}

