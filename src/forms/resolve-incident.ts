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
import { replace, tryPromiseForGenerateMessage } from '../utils/utils';

import { Exception } from '../utils/exception';
import { h6, hyperlink } from '../utils/markdown';

export async function confirmResolveOpenModal(call: AppCallRequest): Promise<AppForm> {
    const oauth2: Oauth2App = call.context.oauth2 as Oauth2App;
    const tokenOpts: PagerDutyOpts = { token: <string>oauth2.user?.token, tokenType: 'bearer' };
    const pdClient: PartialCall = api(tokenOpts);
    const incidentValues: AppCallValues | undefined = call.state.incident;
    const incidentId: string = incidentValues?.id;
    const postId: string = <string>call.context.post?.id;
    const i18nObj = configureI18n(call.context);

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
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.resolved.incident-exception', { summary: incident.summary }), call);
    }

    return {
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
}

export async function callResolveIncidentSubmit(call: AppCallRequest): Promise<string> {
    const oauth2: Oauth2App = call.context.oauth2 as Oauth2App;
    const incidentValues: AppCallValues | undefined = call.state.incident;
    const incidentId: string = incidentValues?.id;
    const postId: string = <string>call.state.post?.id;
    const i18nObj = configureI18n(call.context);

    const pdClient: PartialCall = api({ token: oauth2.user?.token, tokenType: 'bearer' });

    const responseIncident: APIResponse = await tryPromiseForGenerateMessage(
        pdClient.get(
            replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
        ),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.resolved.incident-failed"'),
        call
    );

    const incident: Incident = responseIncident.data.incident;

    if (incident.status === 'resolved') {
        await updatePostResolveIncident(call, postId, incident);
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.resolved.incident-exception', { summary: incident.summary }), call);
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
        i18nObj.__('forms.resolved.incident-update-failed'),
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
    await tryPromiseForGenerateMessage(mattermostClient.getPost(postId), ExceptionType.MARKDOWN, i18nObj.__('forms.resolved.failed'), call);

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
