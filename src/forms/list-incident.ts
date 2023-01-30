import { api } from '@pagerduty/pdjs';
import { APIResponse, PartialCall } from '@pagerduty/pdjs/build/src/api';
import queryString from 'query-string';

import { AppCallRequest, Incident, PagerDutyOpts } from '../types';
import { ExceptionType, Routes } from '../constant';
import { configureI18n } from '../utils/translations';
import { returnPagerdutyToken, tryPromiseForGenerateMessage } from '../utils/utils';

export async function getAllIncidentsCall(call: AppCallRequest): Promise<Incident[]> {
    const i18nObj = configureI18n(call.context);
    const pdToken: PagerDutyOpts = returnPagerdutyToken(call);
    const pdClient: PartialCall = api(pdToken);

    const queryParams: string = queryString.stringify({
        limit: 500,
    });
    const responseIncidents: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(`${Routes.PagerDuty.IncidentsPathPrefix}?${queryParams}`),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.incident-list.get-incident-exception'),
        call
    );
    const incidents: Incident[] = responseIncidents.data.incidents;

    return incidents;
}
