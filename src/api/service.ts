import { Request, Response } from 'express';

import { AppCallRequest, AppCallResponse, AppContext, Service } from '../types';
import {
    newOKCallResponseWithMarkdown,
} from '../utils/call-responses';
import { h6, joinLines } from '../utils/markdown';
import { configureI18n } from '../utils/translations';
import { showMessageToMattermost } from '../utils/utils';
import { getAllServicesCall } from '../forms/list-service';

export const listTeamsSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;
    const call: AppCallRequest = request.body;

    try {
        const services: Service[] = await getAllServicesCall(request.body);
        const servicesText: string = [
            getHeader(services.length, call.context),
            getServices(services, call.context),
        ].join('');
        callResponse = newOKCallResponseWithMarkdown(servicesText);
        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

function getHeader(serviceLength: number, context: AppContext): string {
    const i18nObj = configureI18n(context);

    return h6(i18nObj.__('api.service.text', { length: serviceLength.toString() }));
}

function getServices(services: Service[], context: AppContext): string {
    const i18nObj = configureI18n(context);

    return `${joinLines(
        services.map((service: Service) => i18nObj.__('api.service.service', { id: service.id, name: service.name })).join('\n')
    )}\n`;
}

