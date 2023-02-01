import * as _ from 'lodash';

import { APIResponse, PartialCall, api } from '@pagerduty/pdjs/build/src/api';

import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import { AppExpandLevels, ExceptionType, PagerDutyIcon, Routes } from '../constant';
import {
    AppCallRequest,
    AppCallValues,
    AppForm,
    Incident,
    Oauth2App,
    PagerDutyOpts,
    PostUpdate,
    UpdateIncident,
} from '../types';
import { configureI18n } from '../utils/translations';
import { replace, returnPagerdutyToken, tryPromiseForGenerateMessage } from '../utils/utils';

import { Exception } from '../utils/exception';
import { h6, hyperlink } from '../utils/markdown';
import { AppFormValidator } from '../utils/validator';

export async function confirmResolveOpenModal(call: AppCallRequest): Promise<AppForm> {
    const i18nObj = configureI18n(call.context);
    const pdToken: PagerDutyOpts = returnPagerdutyToken(call);
    const pdClient: PartialCall = api(pdToken);
    const incidentValues: AppCallValues | undefined = call.state.incident;
    const incidentId: string = incidentValues?.id;
    const postId: string = <string>call.context.post?.id;

    const responseIncident: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(
            replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
        ),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.resolved.incident-failed'),
        call
    );

    const incident: Incident = responseIncident.data.incident;
    if (incident?.status === 'resolved') {
        await updatePostResolveIncident(call, postId, incident);
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.resolved.incident-exception', { summary: incident.summary }), i18nObj.__('forms.resolved.incident-exception', { summary: incident.summary }), call);
    }

    const form = {
        title: i18nObj.__('forms.resolved.title-incident'),
        header: i18nObj.__('forms.resolved.header-incident', { summary: incident.summary }),
        icon: PagerDutyIcon,
        fields: [],
        submit: {
            path: `${Routes.App.CallPathIncidentResolveSubmit}`,
            expand: {
                app: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_app: AppExpandLevels.EXPAND_ALL,
                oauth2_user: AppExpandLevels.EXPAND_ALL,
            },
            state: {
                ...call.state,
                post: call.context.post,
            },
        },
    } as AppForm;

    if (!AppFormValidator.safeParse(form).success) {
        throw new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.pagerduty-error'), i18nObj.__('forms.incident.get-incident-exception'), call);
    }

    return form;
}

export async function callResolveIncidentSubmit(call: AppCallRequest): Promise<string> {
    const i18nObj = configureI18n(call.context);
    const pdToken: PagerDutyOpts = returnPagerdutyToken(call);
    const incidentValues: AppCallValues | undefined = call.state.incident;
    const incidentId: string = incidentValues?.id;
    const postId: string = <string>call.state.post?.id;

    const pdClient: PartialCall = api(pdToken);

    const responseIncident: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(
            replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
        ),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.resolved.incident-failed'),
        call
    );

    const incident: Incident = responseIncident.data.incident;

    if (incident.status === 'resolved') {
        await updatePostResolveIncident(call, postId, incident);
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.resolved.incident-exception', { summary: incident.summary }), i18nObj.__('forms.resolved.incident-exception', { summary: incident.summary }), call);
    }

    const data: UpdateIncident = {
        incident: {
            type: 'incident_reference',
            status: 'resolved',
        },
    };

    await tryPromiseForGenerateMessage(
        pdClient.put(
            replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId),
            { data }
        ),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.resolved.resolve-failed'),
        call
    );

    await updatePostResolveIncident(call, postId, incident);
    return i18nObj.__('forms.resolved.incident-update-exception', { summary: incident.summary });
}

async function updatePostResolveIncident(call: AppCallRequest, postId: string, incident: Incident) {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const i18nObj = configureI18n(call.context);

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };

    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await tryPromiseForGenerateMessage(mattermostClient.getPost(postId), ExceptionType.MARKDOWN, i18nObj.__('forms.resolved.get-post-failed'), call);

    const updatePost: PostUpdate = {
        id: postId,
        props: {
            attachments: [
                {
                    title: h6(i18nObj.__('forms.resolved.title-trigger', { url: hyperlink(`${incident.summary}`, incident.html_url) })),
                    title_link: '',
                    color: '#AD251C',
                    fields: [
                        {
                            short: true,
                            title: i18nObj.__('forms.resolved.status-title'),
                            value: i18nObj.__('forms.resolved.status-value'),
                        },
                        {
                            short: true,
                            title: i18nObj.__('forms.resolved.policity-title'),
                            value: `${incident.escalation_policy.summary}`,
                        },
                    ],
                },

            ],
        },
    };
    try {
        await mattermostClient.updatePost(<string>postId, updatePost);
    } catch (error) {
        console.log(error);
    }
}
