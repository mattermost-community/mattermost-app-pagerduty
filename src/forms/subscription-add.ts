import {APIResponse, PartialCall} from '@pagerduty/pdjs/build/src/api';
import {api} from '@pagerduty/pdjs';
import {
    AppCallRequest,
    AppCallValues, Service,
    WebhookSubscription
} from '../types';
import {
    ExceptionType,
    PDFailed,
    Routes,
    SubscriptionCreateForm
} from '../constant';
import {Exception} from '../utils/exception';
import {replace, tryPromiseForGenerateMessage} from '../utils/utils';

export async function subscriptionAddCall(call: AppCallRequest): Promise<void> {
    const appPath: string | undefined = call.context.app_path;
    const whSecret: string | undefined = call.context.app?.webhook_secret;
    const values: AppCallValues | undefined  = call.values;

    const channelId: string = values?.[SubscriptionCreateForm.CHANNEL_ID].value;
    const channelName: string = values?.[SubscriptionCreateForm.CHANNEL_ID].label;
    const serviceId: string = values?.[SubscriptionCreateForm.SERVICE_ID];

    const token = 'u+g8knycscxs-4dyk-Hw';
    const tokenType = 'token';

    const pdClient: PartialCall = api({ token, tokenType });

    const responseSubscriptions: APIResponse = await pdClient.get(Routes.PagerDuty.WebhookSubscriptionsPathPrefix)
    const subscriptions: WebhookSubscription[] = responseSubscriptions.data['webhook_subscriptions'];

    const responseServices: APIResponse = await pdClient.get(replace(Routes.PagerDuty.ServicePathPrefix, Routes.PathsVariable.Identifier, serviceId));
    const service: Service = responseServices.data['service'];

    for (let subscription of subscriptions) {
        const params: URLSearchParams = new URL(subscription.delivery_method.url).searchParams;
        if (params.get('channelId') === channelId && subscription.filter.id === service.id) {
            throw new Exception(ExceptionType.MARKDOWN, `Service [${service.summary}] is already associated with channel [${channelName}]`);
        }
    }

    const urlWithParams = new URL(`https://0395-201-160-204-2.ngrok.io${appPath}${Routes.App.CallPathIncomingWebhookPath}`);
    urlWithParams.searchParams.append('secret', <string>whSecret);
    urlWithParams.searchParams.append('channelId', channelId);

    await tryPromiseForGenerateMessage(pdClient.post(Routes.PagerDuty.WebhookSubscriptionsPathPrefix, {
        data: {
            webhook_subscription: {
                delivery_method: {
                    type: 'http_delivery_method',
                    url: urlWithParams.href,
                    custom_headers: []
                },
                description: `Mattermost_${service.name}_${channelName}`,
                events: [
                    'incident.acknowledged',
                    'incident.annotated',
                    'incident.delegated',
                    'incident.escalated',
                    'incident.priority_updated',
                    'incident.reassigned',
                    'incident.reopened',
                    'incident.resolved',
                    'incident.responder.added',
                    'incident.responder.replied',
                    'incident.status_update_published',
                    'incident.triggered',
                    'incident.unacknowledged',
                    'service.created',
                    'service.deleted',
                    'service.updated'
                ],
                filter: {
                    id: serviceId,
                    type: 'service_reference'
                },
                type: 'webhook_subscription'
            }
        }
    }), ExceptionType.MARKDOWN, PDFailed);
}
