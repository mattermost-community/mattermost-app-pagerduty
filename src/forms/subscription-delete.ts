import {PartialCall} from '@pagerduty/pdjs/build/src/api';
import {api} from '@pagerduty/pdjs';
import {AppCallRequest, AppCallValues,} from '../types';
import {KVStoreClient, KVStoreOptions, KVStoreProps} from '../clients/kvstore';
import {Routes, StoreKeys, SubscriptionDeleteForm} from '../constant';
import {replace, tryPromisePagerDuty} from "../utils/utils";

export async function subscriptionDeleteCall(call: AppCallRequest): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const values: AppCallValues | undefined = call.values;

    const subscriptionId: string = values?.[SubscriptionDeleteForm.SUBSCRIPTION_ID];

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const kvStore: KVStoreClient = new KVStoreClient(options);
    const kvProps: KVStoreProps = await kvStore.kvGet(StoreKeys.config);

    const host: string = new URL(kvProps.pagerduty_client_url).host;
    const pdClient: PartialCall = api({ token: 'u+A6-xHEHsaUDY6U4Wmw', tokenType: 'token', server: host });

    await tryPromisePagerDuty(pdClient.delete(
        replace(
            Routes.PagerDuty.WebhookSubscriptionPathPrefix,
            Routes.PathsVariable.Identifier,
            subscriptionId
        )
    ));
}
