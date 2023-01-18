import { api } from '@pagerduty/pdjs';
import { APIResponse, PartialCall } from '@pagerduty/pdjs/build/src/api';
import queryString from 'query-string';

import { AppCallRequest, Incident, Oauth2App } from '../types';
import { ExceptionType, Routes } from '../constant';
import { configureI18n } from '../utils/translations';
import { tryPromiseForGenerateMessage } from '../utils/utils';

export async function getAllIncidentsCall(call: AppCallRequest): Promise<Incident[]> {
    const oauth2: Oauth2App = call.context.oauth2 as Oauth2App;
    const i18nObj = configureI18n(call.context);

    const pdClient: PartialCall = api({ token: oauth2.user?.token, tokenType: 'bearer' });

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
