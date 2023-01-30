import { APIResponse, PartialCall } from '@pagerduty/pdjs/build/src/api';
import { api } from '@pagerduty/pdjs';

import { AppCallRequest, Oauth2App, PagerDutyOpts, Service } from '../types';
import { ExceptionType, Routes } from '../constant';
import { configureI18n } from '../utils/translations';
import { returnPagerdutyToken, tryPromiseForGenerateMessage } from '../utils/utils';

export async function getAllServicesCall(call: AppCallRequest): Promise<Service[]> {
    const i18nObj = configureI18n(call.context);
    const pdToken: PagerDutyOpts = returnPagerdutyToken(call);
    const pdClient: PartialCall = api(pdToken);

    const responseServices: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(Routes.PagerDuty.ServicesPathPrefix),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.list-service.get-service-failed'),
        call
    );
    const services: Service[] = responseServices?.data.services;
    return services;
}
