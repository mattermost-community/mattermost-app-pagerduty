import {Request, Response} from 'express';
import {
    CallResponseHandler,
    newOKCallResponseWithMarkdown
} from '../utils/call-responses';
import {AppCallRequest, AppCallResponse, WebhookSubscription} from '../types';
import {subscriptionAddCall} from '../forms/subscription-add';
import {subscriptionListCall} from '../forms/subscription-list';
import {h6, joinLines} from '../utils/markdown';
import {subscriptionDeleteCall} from '../forms/subscription-delete';
import {configureI18n} from "../utils/translations";
import {showMessageToMattermost} from '../utils/utils';

export const subscriptionAddSubmit: CallResponseHandler = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;
		const call: AppCallRequest = request.body;
		const i18nObj = configureI18n(call.context);

    try {
        await subscriptionAddCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(i18nObj.__('api.subcription.created'));
        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const subscriptionDeleteSubmit: CallResponseHandler = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;
		const call: AppCallRequest = request.body;
		const i18nObj = configureI18n(call.context);

    try {
        await subscriptionDeleteCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(i18nObj.__('api.subcription.deleted'));
        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const subscriptionListSubmit: CallResponseHandler = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;
		const call: AppCallRequest = request.body;
		const i18nObj = configureI18n(call.context);

    try {
        const integrations: WebhookSubscription[] = await subscriptionListCall(request.body);
        const subscriptionsText: string = [
            h6(i18nObj.__('api.subcription.list', { length: integrations.length.toString() })),
            `${joinLines(
                integrations.map((integration: WebhookSubscription) => 
                    i18nObj.__('api.subcription.subcription_description', 
												{ 
														id: integration.id, 
														service_name: integration.service!.name,
														channel_name: integration.channel!.name
												})
                ).join('\n')
            )}`
        ].join('');

        callResponse = newOKCallResponseWithMarkdown(subscriptionsText);
        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};
