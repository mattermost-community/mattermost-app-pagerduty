import { APIResponse, PartialCall } from '@pagerduty/pdjs/build/src/api';
import { api } from '@pagerduty/pdjs';
import fetch from 'node-fetch';

import {
    AppCallRequest,
    AppCallValues,
    Channel,
    Oauth2App,
    Oauth2CurrentUser,
    OauthUserToken,
    PostCreate,
    UserMe,
} from '../types';
import { KVStoreClient, KVStoreOptions, KVStoreProps } from '../clients/kvstore';
import { ExceptionType, Routes, StoreKeys } from '../constant';
import { configureI18n } from '../utils/translations';
import { encodeFormData, isConnected } from '../utils/utils';
import { Exception } from '../utils/exception';
import config from '../config';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';

export async function oauth2Connect(call: AppCallRequest): Promise<string> {
    const i18nObj = configureI18n(call.context);
    const oauth2: Oauth2App | undefined = call.context.oauth2;
    if (!oauth2) {
        throw new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.oauth2-not-found'), i18nObj.__('general.validation-user.oauth2-not-found'), call);
    }
    const state: string | undefined = call.values?.state;
    const url = `${config.PAGERDUTY.IDENTITY}${Routes.PagerDuty.OAuthAuthorizationPathPrefix}`;

    const urlWithParams = new URL(url);
    urlWithParams.searchParams.append('client_id', oauth2.client_id);
    urlWithParams.searchParams.append('redirect_uri', <string>oauth2.complete_url);
    urlWithParams.searchParams.append('state', <string>state);
    urlWithParams.searchParams.append('response_type', 'code');
    urlWithParams.searchParams.append('scope', 'read write');

    return urlWithParams.href;
}

export async function oauth2Complete(call: AppCallRequest): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const accessToken: string | undefined = call.context.acting_user_access_token;
    const botUserID: string | undefined = call.context.bot_user_id;
    const actingUserID: string | undefined = call.context.acting_user?.id;
    const values: AppCallValues | undefined = call.values;
    const i18nObj = configureI18n(call.context);
    const oauth2: Oauth2App | undefined = call.context.oauth2;
    if (!oauth2) {
        throw new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.oauth2-not-found'), i18nObj.__('general.validation-user.oauth2-not-found'), call);
    }

    if (!values?.code) {
        throw new Error(values?.error_description || i18nObj.__('forms.oauth.exception-complete'));
    }

    const url = `${config.PAGERDUTY.IDENTITY}${Routes.PagerDuty.OAuthTokenPathPrefix}`;
    const oauthData: any = {
        grant_type: 'authorization_code',
        client_id: oauth2.client_id,
        client_secret: oauth2.client_secret,
        redirect_uri: <string>oauth2.complete_url,
        code: values.code,
    };

    const data: OauthUserToken = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: encodeFormData(oauthData),
    }).then((response) => response.json()).
        then((response) =>
            (response.error ?
                Promise.reject(new Error(response.error_description)) :
                response)
        );

    const pdClient: PartialCall = api({ token: data.access_token, tokenType: data.token_type });
    const responseCurrentUser: APIResponse = await pdClient.get(Routes.PagerDuty.CurrentUserPathPrefix);
    const currentUser: UserMe = responseCurrentUser.data.user;

    const kvOptionsOauth: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>accessToken,
    };
    const kvStoreClientOauth = new KVStoreClient(kvOptionsOauth);

    const storedToken: Oauth2CurrentUser = {
        token: data.access_token,
        user: {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
        },
    };
    await kvStoreClientOauth.storeOauth2User(storedToken);

    const mattermostOption: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>accessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOption);
    const channel: Channel = await mattermostClient.createDirectChannel([<string>botUserID, <string>actingUserID]);
    const post: PostCreate = {
        message: i18nObj.__('forms.oauth.successfully-account'),
        user_id: botUserID,
        channel_id: channel.id,
        root_id: '',
    };
    await mattermostClient.createPost(post);
}

export async function oauth2Disconnect(call: AppCallRequest): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const accessToken: string | undefined = call.context.acting_user_access_token;
    const i18nObj = configureI18n(call.context);
    const oauth2: Oauth2App | undefined = call.context.oauth2;
    if (!oauth2) {
        throw new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.oauth2-not-found'), i18nObj.__('general.validation-user.oauth2-not-found'), call);
    }

    if (!isConnected(oauth2)) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.oauth.exception-account'), i18nObj.__('forms.oauth.exception-account'), call);
    }

    const kvOptionsOauth: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>accessToken,
    };
    const kvStoreClientOauth = new KVStoreClient(kvOptionsOauth);

    // delete user of mattermost context
    await kvStoreClientOauth.storeOauth2User({});
}
