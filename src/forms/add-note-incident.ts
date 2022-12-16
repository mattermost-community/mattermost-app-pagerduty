import { APIResponse, PartialCall, api } from '@pagerduty/pdjs/build/src/api';

import { AppExpandLevels, AppFieldTypes, ExceptionType, NoteModalForm, PagerDutyIcon, Routes } from '../constant';
import { AppCallRequest, AppCallValues, AppField, AppForm, Incident, Oauth2App, PagerDutyOpts, PostIncidentNote } from '../types';
import { configureI18n } from '../utils/translations';
import { replace, tryPromiseForGenerateMessage } from '../utils/utils';

export async function addNoteOpenModal(call: AppCallRequest): Promise<AppForm> {
    const oauth2: Oauth2App | undefined = call.context.oauth2;
    const tokenOpts: PagerDutyOpts = { token: <string>oauth2.user?.token, tokenType: 'bearer' };
    const pdClient: PartialCall = api(tokenOpts);
    const incidentValues: AppCallValues | undefined = call.state.incident;
    const incidentId: string = incidentValues?.id;
	 const i18nObj = configureI18n(call.context);

    const responseIncident: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(
            replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
        ),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.add-note.exception')
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

    return {
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
}

export async function addNoteSubmitDialog(call: AppCallRequest): Promise<string> {
    const oauth2: Oauth2App | undefined = call.context.oauth2;
    const incidentValues: AppCallValues | undefined = call.state.incident;
    const incidentId: string = incidentValues?.id;
	 const i18nObj = configureI18n(call.context);

    const values: AppCallValues | undefined = call.values;
    const incidentMessage: string = values?.[NoteModalForm.NOTE_MESSAGE];

    const pdClient: PartialCall = api({ token: oauth2.user?.token, tokenType: 'bearer' });

    const responseIncident: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(
            replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
        ),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms..add-note.exception')
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
        ), ExceptionType.MARKDOWN, i18nObj.__('forms.add-note.failed'));

    return i18nObj.__('forms.add-note.incident', { summary: incident.summary });
}
