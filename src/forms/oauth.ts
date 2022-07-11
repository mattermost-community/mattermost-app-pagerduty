import {AppCallRequest, AppCallValues, OauthUserToken} from '../types';
import {KVStoreClient, KVStoreOptions, KVStoreProps} from '../clients/kvstore';
import {Routes, StoreKeys} from '../constant';
import fetch from 'node-fetch';
import {encodeFormData} from '../utils/utils';

export async function oauth2Connect(call: AppCallRequest): Promise<string> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const oauth2CompleteUrl: string = call.context.oauth2.complete_url;
    const state: string | undefined = call.values?.state;

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const kvStoreClient = new KVStoreClient(kvOptions);
    const kvStoreProps: KVStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const url: string = `${kvStoreProps.pagerduty_client_url}${Routes.PagerDuty.OAuthAuthorizationPathPrefix}`;

    const urlWithParams = new URL(url);
    urlWithParams.searchParams.append('client_id', kvStoreProps.pagerduty_client_id);
    urlWithParams.searchParams.append('redirect_uri', oauth2CompleteUrl);
    urlWithParams.searchParams.append('state', <string>state);
    urlWithParams.searchParams.append('response_type', 'code');
    urlWithParams.searchParams.append('scope', 'read write');

    return urlWithParams.href;
}

export async function oauth2Complete(call: AppCallRequest): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const accessToken: string | undefined = call.context.acting_user_access_token;
    const oauth2CompleteUrl: string = call.context.oauth2.complete_url;
    const values: AppCallValues | undefined = call.values;

    if (!values?.code) {
        throw new Error('Bad Request: code param not provided');
    }

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>accessToken
    };
    const kvStoreClient = new KVStoreClient(kvOptions);
    const kvStoreProps: KVStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const url: string = `https://identity.pagerduty.com${Routes.PagerDuty.OAuthTokenPathPrefix}`;
    const oauthData: any = {
        grant_type: 'authorization_code',
        client_id: kvStoreProps.pagerduty_client_id,
        client_secret: kvStoreProps.pagerduty_client_secret,
        redirect_uri: oauth2CompleteUrl,
        code: values.code
    };
    const data: OauthUserToken = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: encodeFormData(oauthData)
    }).then((response) => response.json())
        .then((response) =>
            response.error ? Promise.reject(new Error(response.error_description)) : response
        );

    const storedToken: any = {
        token: data.access_token,
        role: 'system_admin',
    };
    console.log('data', data);
    console.log('storedToken', storedToken);
    await kvStoreClient.storeOauth2User(storedToken);
}
