import {APIResponse} from '@pagerduty/pdjs/build/src/api';
import {newErrorCallResponseWithMessage, newOKCallResponseWithMarkdown} from './call-responses';
import {ExceptionType, StoreKeys} from '../constant';
import {Exception} from './exception';
import {AppActingUser, AppCallResponse, Oauth2App} from '../types';
import {KVStoreClient, KVStoreProps} from '../clients/kvstore';

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

export function isConnected(oauth2: Oauth2App): boolean {
    return !!oauth2?.user;
}

export function encodeFormData(data: any): string {
    return Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');
}

export async function existsKvTrelloConfig(kvClient: KVStoreClient): Promise<boolean> {
    const trelloConfig: KVStoreProps = await kvClient.kvGet(StoreKeys.config);

    return Boolean(Object.keys(trelloConfig).length);
}

export function tryPromisePagerDuty(p: Promise<any>) {
    return p.then((response: APIResponse) => {
        const data: any = response?.data;
        const errors: any = data?.['errors'];
        if (!!errors) {
            const message: string = errors.detail;
            return Promise.reject(new Error(message));
        }

        return data;
    });
}

export function errorDataMessage(error: Exception | Error | any): string {
    const errorMessage: string = error?.data || error?.data?.message || error?.message || error;
    return `${errorMessage}`;
}

export function tryPromiseForGenerateMessage(p: Promise<any>, exceptionType: ExceptionType, message: string) {
    return p.catch((error) => {
        const errorMessage: string = errorDataMessage(error);
        throw new Exception(exceptionType, `${message} ${errorMessage}`);
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
        function(txt: string) {
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
