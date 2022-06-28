import {api} from '@pagerduty/pdjs';
import {APIResponse, PartialCall} from '@pagerduty/pdjs/build/src/api';
import {
    AppCallRequest, Channel, Service,
    WebhookSubscription,
} from '../types';
import {KVStoreClient, KVStoreOptions, KVStoreProps} from '../clients/kvstore';
import {Routes, StoreKeys} from '../constant';
import {replace} from '../utils/utils';
import {MattermostClient, MattermostOptions} from "../clients/mattermost";
import queryString, {ParsedUrl} from "query-string";

export async function subscriptionListCall(call: AppCallRequest): Promise<WebhookSubscription[]> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const kvStore: KVStoreClient = new KVStoreClient(kvOptions);
    const kvProps: KVStoreProps = await kvStore.kvGet(StoreKeys.config);

    const options: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(options);

    const pdClient: PartialCall = api({ token: 'u+Xfr4svUs-Q5fVDSx_w', tokenType: 'token' });
    const response: APIResponse = await pdClient.get(Routes.PagerDuty.WebhookSubscriptionsPathPrefix);

    const subscriptions: WebhookSubscription[] = response.data['webhook_subscriptions'];
    const responseSubs: Promise<WebhookSubscription>[] = subscriptions.map(async (subs: WebhookSubscription) => {
        const response: APIResponse = await pdClient.get(replace(Routes.PagerDuty.ServicePathPrefix, Routes.PathsVariable.Identifier, subs.filter.id));
        const service: Service = response.data['service'];

        const params: ParsedUrl = queryString.parseUrl(subs.delivery_method.url);
        const channelId: string = <string>params.query?.['channelId'];
        const channel: Channel = await mattermostClient.getChannel(channelId);

        return new Promise((resolve, reject) => resolve({
            ...subs,
            service,
            channel
        }));
    });

    return Promise.all(responseSubs);
}
