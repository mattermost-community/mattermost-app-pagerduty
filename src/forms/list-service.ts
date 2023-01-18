import { APIResponse, PartialCall } from '@pagerduty/pdjs/build/src/api';
import { api } from '@pagerduty/pdjs';

import { AppCallRequest, Oauth2App, Service } from '../types';
import { ExceptionType, Routes } from '../constant';
import { configureI18n } from '../utils/translations';
import { tryPromiseForGenerateMessage } from '../utils/utils';

export async function getAllServicesCall(call: AppCallRequest): Promise<Service[]> {
    const oauth2: Oauth2App = call.context.oauth2 as Oauth2App;
    const i18nObj = configureI18n(call.context);

    const pdClient: PartialCall = api({ token: oauth2.user?.token, tokenType: 'bearer' });

    const responseServices: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(Routes.PagerDuty.ServicesPathPrefix),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.list-service.message'), 
        call
    );
    const services: Service[] = responseServices?.data.services;
    return services;
}
