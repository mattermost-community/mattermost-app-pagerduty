import { api } from '@pagerduty/pdjs';
import { APIResponse, PartialCall } from '@pagerduty/pdjs/build/src/api';

import queryString, { ParsedUrl } from 'query-string';

import {
    AppCallRequest,
    Channel,
    Oauth2App,
    Service,
    WebhookSubscription,
} from '../types';
import { ExceptionType, Routes } from '../constant';
import { configureI18n } from '../utils/translations';
import { replace, tryPromiseForGenerateMessage } from '../utils/utils';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import { h6, joinLines } from '../utils/markdown';

export async function subscriptionListCall(call: AppCallRequest): Promise<string> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const userAccessToken: string | undefined = call.context.acting_user_access_token;
    const oauth2: Oauth2App | undefined = call.context.oauth2;
    const i18nObj = configureI18n(call.context);

    const options: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>userAccessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(options);

    const pdClient: PartialCall = api({ token: oauth2.user?.token, tokenType: 'bearer' });

    const responseAPI: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(Routes.PagerDuty.WebhookSubscriptionsPathPrefix),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.subcription.webhook-failed')
    );

    const subscriptions: WebhookSubscription[] = responseAPI.data.webhook_subscriptions;

    const responseSubs: Promise<WebhookSubscription | undefined>[] = subscriptions.map(async (subs: WebhookSubscription) => {
        const response: APIResponse = await tryPromiseForGenerateMessage(
            pdClient.get(replace(Routes.PagerDuty.ServicePathPrefix, Routes.PathsVariable.Identifier, subs.filter.id)),
            ExceptionType.MARKDOWN,
            i18nObj.__('forms.subcription.service-failed')
        );

        const service: Service = response.data.service;

        const params: ParsedUrl = queryString.parseUrl(subs.delivery_method.url);
        const channelId: string = <string>params.query?.channelId;
        try {
            const channel: Channel = await mattermostClient.getChannel(channelId);
            return new Promise((resolve, reject) => resolve({
                ...subs,
                service,
                channel,
            }));
        } catch (error) {
            return Promise.resolve(undefined);
        }
    });

    const integrations: WebhookSubscription[] = webhookSubscriptionArray(await Promise.all(responseSubs).then());

    const subscriptionsText: string = [
        h6(i18nObj.__('api.subcription.list', { length: integrations.length.toString() })),
        `${joinLines(
            integrations.map((integration: WebhookSubscription) =>
                i18nObj.__('api.subcription.subcription_description',
                    {
                        id: integration.id,
                        service_name: integration.service!.name,
                        channel_name: integration.channel!.name,
                    })
            ).join('\n')
        )}`,
    ].join('');

    return subscriptionsText;
}

function webhookSubscriptionArray(array: (WebhookSubscription | undefined)[]): WebhookSubscription[] {
    return array.filter((el): el is WebhookSubscription => typeof (el) !== 'undefined');
}