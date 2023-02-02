import { APIResponse, PartialCall, api } from '@pagerduty/pdjs/build/src/api';

import { Exception } from '../utils/exception';

import { AppExpandLevels, AppFieldTypes, ExceptionType, NoteModalForm, PagerDutyIcon, Routes } from '../constant';
import { AppCallRequest, AppCallValues, AppField, AppForm, Incident, Oauth2App, PagerDutyOpts, PostIncidentNote } from '../types';
import { configureI18n } from '../utils/translations';
import { replace, returnPagerdutyToken, tryPromiseForGenerateMessage } from '../utils/utils';
import { AppFormValidator } from '../utils/validator';

export async function addNoteOpenModal(call: AppCallRequest): Promise<AppForm> {
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
    const fields: AppField[] = [
        {
            modal_label: i18nObj.__('forms.add-note.label', { summary: incident.summary }),
            type: AppFieldTypes.TEXT,
            name: NoteModalForm.NOTE_MESSAGE,
            description: i18nObj.__('forms.add-note.description'),
            max_length: 25000,
            is_required: true,
        },
    ];

    const form = {
        title: i18nObj.__('forms.add-note.title'),
        icon: PagerDutyIcon,
        fields,
        submit: {
            path: `${Routes.App.CallPathNoteToIncidentSubmit}`,
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

export async function addNoteSubmitDialog(call: AppCallRequest): Promise<string> {
    const i18nObj = configureI18n(call.context);
    const pdToken: PagerDutyOpts = returnPagerdutyToken(call);
    const incidentValues: AppCallValues | undefined = call.state.incident;
    const incidentId: string = incidentValues?.id;

    const values: AppCallValues | undefined = call.values;
    const incidentMessage: string = values?.[NoteModalForm.NOTE_MESSAGE];

    const pdClient: PartialCall = api(pdToken);

    const responseIncident: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(
            replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
        ),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.incident.get-incident-exception'),
        call
    );

    const incident: Incident = responseIncident.data.incident;

    const data: PostIncidentNote = {
        note: {
            content: incidentMessage,
        },
    };

    await tryPromiseForGenerateMessage(
        pdClient.post(
            `${replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)}${Routes.PagerDuty.NotesPathPrefix}`,
            { data }
        ), ExceptionType.MARKDOWN, i18nObj.__('forms.add-note.failed'), call);

    return i18nObj.__('forms.add-note.incident', { summary: incident.summary });
}
