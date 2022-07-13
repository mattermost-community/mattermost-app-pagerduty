import {api} from '@pagerduty/pdjs';
import {APIResponse, PartialCall} from '@pagerduty/pdjs/build/src/api';
import queryString from 'query-string';
import {AppCallRequest, Oauth2App, OnCallRecord} from '../types';
import {ExceptionType, PDFailed, Routes} from '../constant';
import {tryPromiseForGenerateMessage} from '../utils/utils';

export async function getAllOnCall(call: AppCallRequest): Promise<OnCallRecord[]> {
    const oauth2: Oauth2App | undefined = call.context.oauth2;

    const pdClient: PartialCall = api({ token: oauth2.user?.token, tokenType: 'bearer' });

    const queryParams: string = queryString.stringify({
        limit: 100,
        earliest: true
    });
    const responseCalls: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(`${Routes.PagerDuty.OnCallPathPrefix}?${queryParams}`),
        ExceptionType.MARKDOWN,
        'PagerDuty policy failed'
    );
    const onCallList: OnCallRecord[] = responseCalls.data['oncalls'];

    return onCallList;
}
