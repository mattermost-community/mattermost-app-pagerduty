import { APIResponse, PartialCall } from '@pagerduty/pdjs/build/src/api';
import { api } from '@pagerduty/pdjs';

import { AppCallRequest, AppCallValues, PagerDutyOpts, Service, WebhookSubscription } from '../types';
import { ExceptionType, Routes, SubscriptionCreateForm } from '../constant';
import { Exception } from '../utils/exception';
import { configureI18n } from '../utils/translations';
import { replace, returnPagerdutyToken, tryPromiseForGenerateMessage } from '../utils/utils';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';

export async function subscriptionAddCall(call: AppCallRequest): Promise<string> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const accessToken: string | undefined = call.context.acting_user_access_token;
    const botUserID: string | undefined = call.context.bot_user_id;
    const appPath: string | undefined = call.context.app_path;
    const whSecret: string | undefined = call.context.app?.webhook_secret;
    const i18nObj = configureI18n(call.context);
    const pdToken: PagerDutyOpts = returnPagerdutyToken(call);
    const values: AppCallValues | undefined = call.values;

    const channelId: string = values?.[SubscriptionCreateForm.CHANNEL_ID].value;
    const channelName: string = values?.[SubscriptionCreateForm.CHANNEL_ID].label;
    const serviceId: string = values?.[SubscriptionCreateForm.SERVICE_ID];

    const pdClient: PartialCall = api(pdToken);

    const responseSubscriptions: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(Routes.PagerDuty.WebhookSubscriptionsPathPrefix),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.subcription.webhook-failed'),
        call
    );
    const subscriptions: WebhookSubscription[] = responseSubscriptions.data.webhook_subscriptions;

    const responseServices: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(replace(Routes.PagerDuty.ServicePathPrefix, Routes.PathsVariable.Identifier, serviceId)),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.subcription.service-failed'),
        call
    );
    const service: Service = responseServices.data.service;

    for (const subscription of subscriptions) {
        const params: URLSearchParams = new URL(subscription.delivery_method.url).searchParams;
        if (params.get('channelId') === channelId && subscription.filter.id === service.id) {
            throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.subcription.service-exception', { summary: service.summary, channel: channelName }), i18nObj.__('forms.subcription.service-exception', { summary: service.summary, channel: channelName }), call);
        }
    }

    const urlWithParams = new URL(`${mattermostUrl}${appPath}${Routes.App.CallPathIncomingWebhookPath}`);
    urlWithParams.searchParams.append('secret', <string>whSecret);
    urlWithParams.searchParams.append('channelId', channelId);

    await tryPromiseForGenerateMessage(pdClient.post(Routes.PagerDuty.WebhookSubscriptionsPathPrefix, {
        data: {
            webhook_subscription: {
                delivery_method: {
                    type: 'http_delivery_method',
                    url: urlWithParams.href,
                    custom_headers: [],
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
                    'service.updated',
                ],
                filter: {
                    id: serviceId,
                    type: 'service_reference',
                },
                type: 'webhook_subscription',
            },
        },
    }), ExceptionType.MARKDOWN, i18nObj.__('forms.subcription.webhook-post-failed'), call);

    const mattermostOption: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>accessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOption);
    await mattermostClient.addMemberToChannel(channelId, <string>botUserID);

    return i18nObj.__('api.subcription.created');
}
