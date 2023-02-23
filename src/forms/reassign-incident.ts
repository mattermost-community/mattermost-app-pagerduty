import { APIResponse, PartialCall, api } from '@pagerduty/pdjs/build/src/api';

import { Exception } from '../utils/exception';

import { AppExpandLevels, AppFieldTypes, ExceptionType, PagerDutyIcon, ReassignIncidentForm, Routes } from '../constant';
import { AppCallRequest, AppCallValues, AppField, AppForm, AppSelectOption, Incident, Oauth2App, PagerDutyOpts, UpdateIncident, UserResponse } from '../types';
import { configureI18n } from '../utils/translations';
import { replace, returnPagerdutyToken, tryPromiseForGenerateMessage } from '../utils/utils';

import { AppFormValidator } from '../utils/validator';

import { getUsersOptionList } from './pagerduty-options';

export async function reassignIncidentActionForm(call: AppCallRequest): Promise<AppForm> {
    const i18nObj = configureI18n(call.context);
    const pdToken: PagerDutyOpts = returnPagerdutyToken(call);

    const incidentValues: AppCallValues | undefined = call.state.incident;
    const incidentId: string = incidentValues?.id;

    const pdClient: PartialCall = api(pdToken);

    const responseIncident: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(
            replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
        ),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.reassign.incident-failed'),
        call
    );
    const incident: Incident = responseIncident.data.incident;

    const assignToOpts: AppSelectOption[] = await getUsersOptionList(call);
    const fields: AppField[] = [
        {
            modal_label: 'User',
            type: AppFieldTypes.STATIC_SELECT,
            name: ReassignIncidentForm.ASSIGN_TO,
            is_required: true,
            options: assignToOpts,
        },
    ];

    const form = {
        title: i18nObj.__('forms.reassign.title'),
        header: i18nObj.__('forms.reassign.header', { summary: incident.summary }),
        icon: PagerDutyIcon,
        fields,
        submit: {
            path: `${Routes.App.CallPathAssignIncidentSubmit}`,
            expand: {
                app: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_app: AppExpandLevels.EXPAND_ALL,
                oauth2_user: AppExpandLevels.EXPAND_ALL,
            },
            state: call.state,
        },
    } as AppForm;

    if (!AppFormValidator.safeParse(form).success) {
        throw new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.pagerduty-error'), i18nObj.__('forms.incident.error-validation-form'), call);
    }

    return form;
}

export async function reassignIncidentSubmitForm(call: AppCallRequest): Promise<string> {
    const i18nObj = configureI18n(call.context);
    const pdToken: PagerDutyOpts = returnPagerdutyToken(call);

    const incidentValues: AppCallValues | undefined = call.state.incident;
    const incidentId: string = incidentValues?.id;

    const values: AppCallValues | undefined = call.values;
    const assignTo: AppSelectOption = values?.[ReassignIncidentForm.ASSIGN_TO];
    const pdClient: PartialCall = api(pdToken);

    const responseIncident: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(
            replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
        ),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.reassign.incident-failed'),
        call
    );
    const incident: Incident = responseIncident.data.incident;

    const responseUser: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(
            replace(Routes.PagerDuty.UserPathPrefix, Routes.PathsVariable.Identifier, assignTo.value)
        ),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.reassign.user-failed'),
        call
    );
    const user: UserResponse = responseUser.data.user;

    const data: UpdateIncident = {
        incident: {
            type: 'incident',
            assignments: [
                {
                    assignee: {
                        id: assignTo.value,
                        type: 'user',
                    },
                },
            ],
        },
    };

    await tryPromiseForGenerateMessage(
        pdClient.put(
            replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId),
            { data }
        ),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.reassign.user-update'),
        call
    );
    return i18nObj.__('forms.reassign.reassign-incident', { summary: incident.summary, name: user?.name });
}
