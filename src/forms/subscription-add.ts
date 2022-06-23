import {APIResponse, PartialCall} from '@pagerduty/pdjs/build/src/api';
import {api} from '@pagerduty/pdjs';
import {
    AppCallRequest,
    AppCallValues,
    WebhookSubscription
} from '../types';
import {KVStoreClient, KVStoreOptions, KVStoreProps} from '../clients/kvstore';
import {Routes, StoreKeys, SubscriptionCreateForm} from '../constant';

export async function subscriptionAddCall(call: AppCallRequest): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const appPath: string | undefined = call.context.app_path;
    const whSecret: string | undefined = call.context.app?.webhook_secret;
    const values: AppCallValues | undefined  = call.values;

    const channelId: string = values?.[SubscriptionCreateForm.CHANNEL_ID].value;
    const channelName: string = values?.[SubscriptionCreateForm.CHANNEL_ID].label;

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const kvStore: KVStoreClient = new KVStoreClient(options);
    const kvProps: KVStoreProps = await kvStore.kvGet(StoreKeys.config);

    const host: string = new URL(kvProps.pagerduty_client_url).host;
    const pdClient: PartialCall = api({ token: 'u+Xfr4svUs-Q5fVDSx_w', tokenType: 'token', server: host });

    const responseSubscriptions: APIResponse = await pdClient.get(Routes.PagerDuty.WebhookSubscriptionsPathPrefix)
    const subscriptions: WebhookSubscription[] = responseSubscriptions.data['webhook_subscriptions'];
    for (let subscription of subscriptions) {
        const params: URLSearchParams = new URL(subscription.delivery_method.url).searchParams;
        if (params.get('channelId') === channelId) {
            throw new Error(`Service [PENDING] is already associated with channel [${channelName}]`);
        }
    }

    const urlWithParams = new URL(`https://c1cd-201-160-205-161.ngrok.io/${appPath}${Routes.App.CallPathIncomingWebhookPath}`);
    urlWithParams.searchParams.append('secret', <string>whSecret);
    urlWithParams.searchParams.append('channelId', channelId);

    await pdClient.post(Routes.PagerDuty.WebhookSubscriptionsPathPrefix, {
        data: {
            webhook_subscription: {
                delivery_method: {
                    type: 'http_delivery_method',
                    url: urlWithParams.href,
                    custom_headers: []
                },
                description: `Mattermost_${channelName}`,
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
                    id: 'PLGPKKQ',
                    type: 'service_reference'
                },
                type: 'webhook_subscription'
            }
        }
    });
}
