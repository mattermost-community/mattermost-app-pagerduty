import {api} from '@pagerduty/pdjs';
import {APIResponse, PartialCall} from '@pagerduty/pdjs/build/src/api';
import {
    AppCallRequest,
    WebhookSubscription,
} from '../types';
import {KVStoreClient, KVStoreOptions, KVStoreProps} from '../clients/kvstore';
import {Routes, StoreKeys} from '../constant';

export async function subscriptionListCall(call: AppCallRequest): Promise<WebhookSubscription[]> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const kvStore: KVStoreClient = new KVStoreClient(options);
    const kvProps: KVStoreProps = await kvStore.kvGet(StoreKeys.config);

    const host: string = new URL(kvProps.pagerduty_client_url).host;
    const pdClient: PartialCall = api({ token: 'u+Xfr4svUs-Q5fVDSx_w', tokenType: 'token', server: host });
    const response: APIResponse = await pdClient.get(Routes.PagerDuty.WebhookSubscriptionsPathPrefix);

    return response.data['webhook_subscriptions'];
}
