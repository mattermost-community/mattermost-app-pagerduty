import { api } from '@pagerduty/pdjs';
import { APIResponse, PartialCall } from '@pagerduty/pdjs/build/src/api';
import queryString from 'query-string';

import { AppCallRequest, Oauth2App, OnCallRecord, PagerDutyOpts } from '../types';
import { ExceptionType, Routes } from '../constant';
import { configureI18n } from '../utils/translations';
import { returnPagerdutyToken, tryPromiseForGenerateMessage } from '../utils/utils';

export async function getAllOnCall(call: AppCallRequest): Promise<OnCallRecord[]> {
    const i18nObj = configureI18n(call.context);
    const pdToken: PagerDutyOpts = returnPagerdutyToken(call);
    const pdClient: PartialCall = api(pdToken);

    const queryParams: string = queryString.stringify({
        limit: 100,
        earliest: true,
    });
    const responseCalls: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(`${Routes.PagerDuty.OnCallPathPrefix}?${queryParams}`),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.list-call.get-oncall-failed'),
        call
    );
    const onCallList: OnCallRecord[] = responseCalls.data.oncalls;

    return onCallList;
}
