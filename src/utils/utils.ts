import { APIResponse } from '@pagerduty/pdjs/build/src/api';

import { ExceptionType } from '../constant';

import { AppActingUser, AppCallRequest, AppCallResponse, Oauth2App, Oauth2CurrentUser, PagerDutyOpts } from '../types';

import config from '../config';

import { Exception } from './exception';
import { newErrorCallResponseWithMessage, newOKCallResponseWithMarkdown } from './call-responses';
import { configureI18n } from './translations';

export function replace(value: string, searchValue: string, replaceValue: string): string {
    return value.replace(searchValue, replaceValue);
}

export function errorPagerdutyWithMessage(error: Error | any, message: string): string {
    const errorMessage: any = error?.data?.message || error?.response?.data?.message || error?.message || error?.data || error?.statusText || error;
    return `"${message}".  ${errorMessage}`;
}

export async function tryPromisePagerdutyWithMessage(p: Promise<any>, message: string): Promise<any> {
    return p.catch((error) => {
        throw new Error(errorPagerdutyWithMessage(error, message));
    });
}

export function isConnected(oauth2: Oauth2App | undefined): boolean {
    if (!oauth2) {
        return false;
    }
    return Boolean(oauth2?.user) && Boolean(Object.keys(<Oauth2CurrentUser>oauth2.user).length);
}

export function encodeFormData(data: any): string {
    return Object.keys(data).
        map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])).
        join('&');
}

export function existsOauth2AppConfig(oauth2App: Oauth2App | undefined): boolean {
    if (!oauth2App) {
        return false;
    }
    return Boolean(oauth2App.client_id) && Boolean(oauth2App.client_secret);
}

export function tryPromisePagerDuty(p: Promise<any>) {
    return p.then((response: APIResponse) => {
        const data: any = response?.data;
        const errors: any = data?.errors;
        if (Boolean(errors)) {
            const message: string = errors.detail;
            return Promise.reject(new Error(message));
        }

        return data;
    });
}

export function errorDataMessage(error: Exception | Error | any): string {
    const errorMessage: string = error?.data || error?.data?.message || error?.message || error?.response?.statusText || error;
    return `${errorMessage}`;
}

export function errorDataPagerduty(data: any): string {
    const errorMessage: string = data?.data?.errors?.detail || data?.data?.error?.errors?.join() || data?.data?.error?.message;
    return errorMessage;
}

export function tryPromiseForGenerateMessage(p: Promise<any>, exceptionType: ExceptionType, message: string, call: AppCallRequest) {
    return p.
        then((response) =>
            (Boolean(errorDataPagerduty(response)) ?
                Promise.reject(new Error(errorDataPagerduty(response))) :
                response)
        ).
        catch((error) => {
            const errorMessage: string = errorDataMessage(error);
            throw new Exception(exceptionType, message, errorMessage, call);
        });
}

export function showMessageToMattermost(exception: Exception | Error): AppCallResponse {
    if (!(exception instanceof Exception)) {
        return newErrorCallResponseWithMessage(exception.message);
    }

    switch (exception.type) {
    case ExceptionType.TEXT_ERROR: return newErrorCallResponseWithMessage(exception.message);
    case ExceptionType.MARKDOWN: return newOKCallResponseWithMarkdown(exception.message);
    default: return newErrorCallResponseWithMessage(exception.message);
    }
}

export function toTitleCase(str: string): string {
    return str.replace(
        /\w\S*/g,
        (txt: string) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

export function isConfigured(oauth2: any): boolean {
    return Boolean(oauth2.client_id && oauth2.client_secret);
}

export function isUserSystemAdmin(actingUser: AppActingUser): boolean {
    return Boolean(actingUser.roles && actingUser.roles.includes('system_admin'));
}

export function getHTTPPath(): string {
    const host: string = config.APP.HOST;
    const ip: string = host.replace(/^(http:\/\/|https:\/\/|)/g, '');

    if ((/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/).test(ip)) {
        return `${config.APP.HOST}:${config.APP.PORT}`;
    }

    return config.APP.HOST;
}

export function returnPagerdutyToken(call: AppCallRequest): PagerDutyOpts {
    const i18nObj = configureI18n(call.context);
    const oauth2: Oauth2App | undefined = call.context.oauth2;
    if (!oauth2) {
        throw new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.oauth2-not-found'), i18nObj.__('general.validation-user.oauth2-not-found'), call);
    }

    const userToken = oauth2.user?.token;
    if (!userToken) {
        throw new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.oauth2-not-found'), i18nObj.__('general.validation-user.oauth2-not-found'), call);
    }

    return { token: userToken, tokenType: 'bearer' };
}

export function routesJoin(routes: Array<string>) {
    return ''.concat(...routes);
}