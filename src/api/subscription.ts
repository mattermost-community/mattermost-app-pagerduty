import {Request, Response} from 'express';
import {
    CallResponseHandler,
    newErrorCallResponseWithMessage,
    newOKCallResponseWithMarkdown
} from '../utils/call-responses';
import {AppCallResponse, WebhookSubscription} from '../types';
import {subscriptionAddCall} from '../forms/subscription-add';
import {subscriptionListCall} from '../forms/subscription-list';
import {h6, joinLines} from '../utils/markdown';
import {subscriptionDeleteCall} from '../forms/subscription-delete';
import { showMessageToMattermost } from '../utils/utils';

export const subscriptionAddSubmit: CallResponseHandler = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await subscriptionAddCall(request.body);
        callResponse = newOKCallResponseWithMarkdown("Subscription will be created");
        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const subscriptionDeleteSubmit: CallResponseHandler = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await subscriptionDeleteCall(request.body);
        callResponse = newOKCallResponseWithMarkdown("Subscription will be deleted");
        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const subscriptionListSubmit: CallResponseHandler = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const integrations: WebhookSubscription[] = await subscriptionListCall(request.body);
        const subscriptionsText: string = [
            h6(`Subscription List: Found ${integrations.length} open subscriptions.`),
            `${joinLines(
                integrations.map((integration: WebhookSubscription) => 
                    `- Subscription ID: "${integration.id}" - Service Name "${integration.service?.name}" - Channel Name "${integration.channel?.name}"`
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
