import {api} from '@pagerduty/pdjs';
import {APIResponse, PartialCall} from '@pagerduty/pdjs/build/src/api';
import queryString from 'query-string';
import {AppCallRequest, OnCallRecord} from '../types';
import {ExceptionType, PDFailed, Routes} from '../constant';
import { tryPromiseForGenerateMessage } from '../utils/utils';

export async function getAllOnCall(call: AppCallRequest): Promise<OnCallRecord[]> {
    const token = 'u+g8knycscxs-4dyk-Hw';
    const tokenType = 'token';

    const pdClient: PartialCall = api({ token, tokenType });

    const queryParams: string = queryString.stringify({
        limit: 100,
        earliest: true
    });
    
    const responseServices: APIResponse = await tryPromiseForGenerateMessage(pdClient.get(`${Routes.PagerDuty.OnCallPathPrefix}?${queryParams}`), ExceptionType.MARKDOWN, PDFailed);
    const onCallList: OnCallRecord[] = responseServices.data['oncalls'];

    return onCallList;
}
