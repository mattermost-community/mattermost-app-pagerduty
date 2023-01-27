import { APIResponse, PartialCall, api } from '@pagerduty/pdjs/build/src/api';

import {
    AppCallRequest,
    AppCallValues,
    Incident,
    Oauth2App,
    PagerDutyOpts,
    UpdateIncident,
} from '../types';
import { ExceptionType, Routes } from '../constant';
import { configureI18n } from '../utils/translations';
import { replace, returnPagerdutyToken, tryPromiseForGenerateMessage } from '../utils/utils';

export async function ackAlertAction(call: AppCallRequest): Promise<string> {
    const i18nObj = configureI18n(call.context);
    const pdToken: PagerDutyOpts = returnPagerdutyToken(call);
    const incidentValue: AppCallValues | undefined = call.state.incident;
    const incidentId: string = incidentValue?.id;
    let message: string;

    try {
        const pdClient: PartialCall = api(pdToken);
        const responseSubscriptions: APIResponse = await tryPromiseForGenerateMessage(
            pdClient.get(
                replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
            ),
            ExceptionType.MARKDOWN,
            i18nObj.__('forms.incident.get-incident-exception'),
            call
        );

        const incident: Incident = responseSubscriptions.data.incident;

        if (incident.status === 'acknowledged') {
            throw new Error(i18nObj.__('forms.incident.error', { summary: incident.summary }));
        }

        const data: UpdateIncident = {
            incident: {
                type: 'incident',
                status: 'acknowledged',
            },
        };

        await tryPromiseForGenerateMessage(
            pdClient.put(
                replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId),
                { data }
            ),
            ExceptionType.MARKDOWN,
            i18nObj.__('forms.incident.exception_update'),
            call
        );

        message = i18nObj.__('forms.incident.message', { summary: incident.summary });
    } catch (error: any) {
        message = error.message;
    }

    return message;
}
