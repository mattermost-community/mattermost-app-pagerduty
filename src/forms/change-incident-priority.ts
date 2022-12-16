import { APIResponse, PartialCall, api } from '@pagerduty/pdjs/build/src/api';

import { AppExpandLevels, AppFieldTypes, ChangeIncidentPriorityForm, ExceptionType, PagerDutyIcon, ReassignIncidentForm, Routes } from '../constant';
import { AppCallRequest, AppCallValues, AppField, AppForm, AppSelectOption, Incident, Oauth2App, PagerDutyOpts, Priority, UpdateIncident, UserResponse } from '../types';
import { configureI18n } from '../utils/translations';
import { replace, tryPromiseForGenerateMessage } from '../utils/utils';

import { getPrioritiesOptionList, getUsersOptionList } from './pagerduty-options';

export async function changeIncidentPriorityActionForm(call: AppCallRequest): Promise<AppForm> {
    const oauth2: Oauth2App = call.context.oauth2 as Oauth2App;
    const tokenOpts: PagerDutyOpts = { token: <string>oauth2.user?.token, tokenType: 'bearer' };
    const i18nObj = configureI18n(call.context);

    const incidentValues: AppCallValues | undefined = call.state.incident;
    const incidentId: string = incidentValues?.id;

    const pdClient: PartialCall = api(tokenOpts);

    const responseIncident: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(
            replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
        ),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.incident.exception')
    );
    const incident: Incident = responseIncident.data.incident;

    const prioritiesOpts: AppSelectOption[] = await getPrioritiesOptionList(tokenOpts, call.context);
    const fields: AppField[] = [
        {
            modal_label: i18nObj.__('forms.change-incident.label-priorities'),
            type: AppFieldTypes.STATIC_SELECT,
            name: ChangeIncidentPriorityForm.PRIORITY,
            is_required: true,
            options: prioritiesOpts,
        },
    ];

    return {
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
}

export async function changeIncidentPrioritySubmitForm(call: AppCallRequest): Promise<string> {
    const oauth2: Oauth2App = call.context.oauth2 as Oauth2App;
    const tokenOpts: PagerDutyOpts = { token: <string>oauth2.user?.token, tokenType: 'bearer' };
    const i18nObj = configureI18n(call.context);

    const incidentValues: AppCallValues | undefined = call.state.incident;
    const incidentId: string = incidentValues?.id;

    const values: AppCallValues | undefined = call.values;
    const assignTo: AppSelectOption = values?.[ChangeIncidentPriorityForm.PRIORITY];
    const pdClient: PartialCall = api(tokenOpts);

    const responseIncident: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(
            replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
        ),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.add-note.exception')
    );
    const incident: Incident = responseIncident.data.incident;

    const responsePriority: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(
            replace(Routes.PagerDuty.PriorityPathPrefix, Routes.PathsVariable.Identifier, assignTo.value)
        ),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.add-note.exception')
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
        i18nObj.__('forms.change-incident.update')
    );
    return i18nObj.__('forms.change-incident.update-failed', { summary: incident.summary, name: priority.name });
}
