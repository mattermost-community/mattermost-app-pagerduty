import {APIResponse} from '@pagerduty/pdjs/build/src/api';
import {newErrorCallResponseWithMessage, newOKCallResponseWithMarkdown} from './call-responses';
import {ExceptionType} from "../constant";
import {Exception} from "./exception";
import {AppCallResponse} from "../types";

export function replace(value: string, searchValue: string, replaceValue: string): string {
    return value.replace(searchValue, replaceValue);
}

export function encodeFormData(data: any): string {
    return Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');
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
