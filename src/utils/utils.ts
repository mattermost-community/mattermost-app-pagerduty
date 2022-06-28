import {APIResponse} from '@pagerduty/pdjs/build/src/api';
import {newErrorCallResponseWithMessage, newOKCallResponseWithMarkdown} from './call-responses';
import {ExceptionType} from "../constant";
import {Exception} from "./exception";
import { AppCallResponse, AppActingUser } from "../types";
import GeneralConstants from '../constant/general';

const crypto = require('crypto').webcrypto;

export function replace(value: string, searchValue: string, replaceValue: string): string {
    return value.replace(searchValue, replaceValue);
}

export function errorWithMessage(error: Error, message: string): string {
    return `"${message}".  ${error.message}`;
}

export function errorPagerdutyWithMessage(error: Error | any, message: string): string {
    const errorMessage: any = error?.data?.message || error?.message || error?.data || error?.statusText || error;
    return `"${message}".  ${errorMessage}`;
}

export async function tryPromiseWithMessage(p: Promise<any>, message: string): Promise<any> {
    return p.catch((error) => {
        console.log('error', error);
        throw new Error(errorWithMessage(error, message));
    });
}

export async function tryPromisePagerdutyWithMessage(p: Promise<any>, message: string): Promise<any> {
    return p.catch((error) => {
        throw new Error(errorPagerdutyWithMessage(error.response, message));
    });
}

export function isConnected(oauth2user: any): boolean {
    return !!oauth2user?.token?.access_token;
}
export function encodeFormData(data: any): string {
    return Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');
}

export function base64Unicode(buffer: Iterable<number> | ArrayBuffer) {
    /*\
    |*|
    |*|  Base64 / binary data / UTF-8 strings utilities (#1)
    |*|
    |*|  https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
    |*|
    |*|  Author: madmurphy
    |*|
    \*/
    const uint6ToB64 = function(nUint6: number) {

        return nUint6 < 26 ?
            nUint6 + 65 :
            nUint6 < 52 ?
                nUint6 + 71 :
                nUint6 < 62 ?
                    nUint6 - 4 :
                    nUint6 === 62 ?
                        43 :
                        nUint6 === 63 ?
                            47 :
                            65;

    }
    const base64EncArr = function(aBytes: string | any[] | Uint8Array) {

        let eqLen = (3 - (aBytes.length % 3)) % 3,
            sB64Enc = "";

        for (let nMod3, nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
            nMod3 = nIdx % 3;
            /* Uncomment the following line in order to split the output in lines 76-character long: */
            /*
            if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) { sB64Enc += "\r\n"; }
            */
            nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
            if (nMod3 === 2 || aBytes.length - nIdx === 1) {
                sB64Enc += String.fromCharCode(uint6ToB64(nUint24 >>> 18 & 63), uint6ToB64(nUint24 >>> 12 & 63), uint6ToB64(nUint24 >>> 6 & 63), uint6ToB64(nUint24 & 63));
                nUint24 = 0;
            }
        }

        return eqLen === 0 ?
            sB64Enc :
            sB64Enc.substring(0, sB64Enc.length - eqLen) + (eqLen === 1 ? "=" : "==");
    };
    // @ts-ignore
    let encodedArr =  base64EncArr(new Uint8Array(buffer));
    // manually finishing up the url encoding fo the encodedArr
    encodedArr = encodedArr.replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    return encodedArr;
}

export function gen128x8bitNonce(): string {
    // account for the overhead of going to base64
    var bytes = Math.floor(128  / 1.37);
    var array = new Uint8Array(bytes); //
    // note: there was a bug where getRandomValues was assumed
    // to modify the reference to the array and not return
    // a value
    array = crypto.getRandomValues(array);
    return base64Unicode(array.buffer);
}

export async function digestVerifier(vString: string | undefined): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const verifier = encoder.encode(vString);
    const hash = await crypto.subtle.digest('SHA-256', verifier);
    return hash;
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
    return Boolean(actingUser.roles && actingUser.roles.includes(GeneralConstants.SYSTEM_ADMIN_ROLE));
}