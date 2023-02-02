import { APIResponse, PartialCall, api } from '@pagerduty/pdjs/build/src/api';

import { Exception } from '../utils/exception';

import { AppExpandLevels, AppFieldTypes, ChangeIncidentPriorityForm, ExceptionType, PagerDutyIcon, ReassignIncidentForm, Routes } from '../constant';
import { AppCallRequest, AppCallValues, AppField, AppForm, AppSelectOption, Incident, Oauth2App, PagerDutyOpts, Priority, UpdateIncident, UserResponse } from '../types';
import { configureI18n } from '../utils/translations';
import { replace, returnPagerdutyToken, tryPromiseForGenerateMessage } from '../utils/utils';

import { AppFormValidator } from '../utils/validator';

import { getPrioritiesOptionList } from './pagerduty-options';

export async function changeIncidentPriorityActionForm(call: AppCallRequest): Promise<AppForm> {
    const i18nObj = configureI18n(call.context);
    const pdToken: PagerDutyOpts = returnPagerdutyToken(call);
    const pdClient: PartialCall = api(pdToken);

    const incidentValues: AppCallValues | undefined = call.state.incident;
    const incidentId: string = incidentValues?.id;

    const responseIncident: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(
            replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
        ),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.incident.get-incident-exception'),
        call
    );
    const incident: Incident = responseIncident.data.incident;

    const prioritiesOpts: AppSelectOption[] = await getPrioritiesOptionList(call);
    const fields: AppField[] = [
        {
            modal_label: i18nObj.__('forms.change-incident.label-priorities'),
            type: AppFieldTypes.STATIC_SELECT,
            name: ChangeIncidentPriorityForm.PRIORITY,
            is_required: true,
            options: prioritiesOpts,
        },
    ];

    const form = {
        title: i18nObj.__('forms.change-incident.title'),
        header: i18nObj.__('forms.change-incident.header', { summary: incident.summary }),
        icon: PagerDutyIcon,
        fields,
        submit: {
            path: `${Routes.App.CallPathChangeIncidentPrioritySubmit}`,
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

export async function changeIncidentPrioritySubmitForm(call: AppCallRequest): Promise<string> {
    const i18nObj = configureI18n(call.context);

    const pdToken: PagerDutyOpts = returnPagerdutyToken(call);
    const pdClient: PartialCall = api(pdToken);

    const incidentValues: AppCallValues | undefined = call.state.incident;
    const incidentId: string = incidentValues?.id;

    const values: AppCallValues | undefined = call.values;
    const assignTo: AppSelectOption = values?.[ChangeIncidentPriorityForm.PRIORITY];

    const responseIncident: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(
            replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
        ),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.incident.get-incident-exception'),
        call
    );
    const incident: Incident = responseIncident.data.incident;

    const responsePriority: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(
            replace(Routes.PagerDuty.PriorityPathPrefix, Routes.PathsVariable.Identifier, assignTo.value)
        ),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.incident.get-incident-exception'),
        call
    );
    const priority: Priority = responsePriority.data.priority;

    const data: UpdateIncident = {
        incident: {
            type: 'incident',
            priority,
        },
    };

    await tryPromiseForGenerateMessage(
        pdClient.put(
            replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId),
            { data }
        ),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.change-incident.update-failed'),
        call
    );
    return i18nObj.__('forms.change-incident.update', { summary: incident.summary, name: priority.name });
}
