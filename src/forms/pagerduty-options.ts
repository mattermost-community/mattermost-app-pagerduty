import { api } from '@pagerduty/pdjs';
import { APIResponse, PartialCall } from '@pagerduty/pdjs/build/src/api';

import { ExceptionType, Routes } from '../constant';
import { AppCallRequest, AppSelectOption, PagerDutyOpts, Priority, Service } from '../types';
import { configureI18n } from '../utils/translations';
import { returnPagerdutyToken, tryPromiseForGenerateMessage } from '../utils/utils';

export async function getServiceOptionList(call: AppCallRequest): Promise<AppSelectOption[]> {
    const pdToken: PagerDutyOpts = returnPagerdutyToken(call);
    const pdClient: PartialCall = api(pdToken);
    const i18nObj = configureI18n(call.context);

    const responseServices: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(Routes.PagerDuty.ServicesPathPrefix),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.option.service-failed'),
        call
    );
    const services: Service[] = responseServices?.data.services;
    if (Boolean(services)) {
        const options: AppSelectOption[] = [...services.map((b: any) => {
            return { label: b.name, value: b.id };
        })];
        return options;
    }

    return [];
}

export async function getUsersOptionList(call: AppCallRequest): Promise<AppSelectOption[]> {
    const pdToken: PagerDutyOpts = returnPagerdutyToken(call);
    const pdClient: PartialCall = api(pdToken);
    const i18nObj = configureI18n(call.context);
    const responseServices: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(Routes.PagerDuty.UsersPathPrefix),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.option.user-failed'),
        call
    );

    const users: Service[] = responseServices?.data.users;
    if (Boolean(users)) {
        const options: AppSelectOption[] = [...users.map((b: any) => {
            return { label: b.email, value: b.id };
        })];
        return options;
    }

    return [];
}

export async function getPrioritiesOptionList(call: AppCallRequest): Promise<AppSelectOption[]> {
    const pdToken: PagerDutyOpts = returnPagerdutyToken(call);
    const pdClient: PartialCall = api(pdToken);
    const i18nObj = configureI18n(call.context);
    const responseServices: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(Routes.PagerDuty.PrioritiesPathPrefix),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.option.priorities-failed'),
        call
    );

    const priorities: Priority[] = responseServices?.data.priorities;
    if (Boolean(priorities)) {
        const options: AppSelectOption[] = [...priorities.map((b: Priority) => {
            return { label: b.name, value: b.id };
        })];
        return options;
    }

    return [];
}
