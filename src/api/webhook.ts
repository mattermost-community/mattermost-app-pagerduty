import {Request, Response} from 'express';
import queryString, {ParsedQuery} from 'query-string';
import {
    EventWebhook,
    AddNoteWebhook,
    AppCallResponse,
    AppContext,
    AppContextAction, Incident,
    PostCreate,
    WebhookEvent,
    WebhookRequest,
    Manifest
} from '../types';
import {newErrorCallResponseWithMessage, newOKCallResponse} from '../utils/call-responses';
import {ActionsEvents, AppExpandLevels, options_incident} from '../constant';
import {MattermostClient, MattermostOptions} from '../clients/mattermost';
import config from '../config';
import {Routes} from '../constant'
import {h6, hyperlink} from '../utils/markdown';
import {configureI18n} from "../utils/translations";
import {replace, toTitleCase} from '../utils/utils';
import {APIResponse, PartialCall} from "@pagerduty/pdjs/build/src/api";
import {api} from "@pagerduty/pdjs";
import manifest from '../manifest.json';

async function notifyIncidentTriggered({ data: { event }, rawQuery }: WebhookRequest<WebhookEvent<EventWebhook>>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const eventData: EventWebhook = event.data;
    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);
    const channelId: string = <string>parsedQuery['channelId'];
    const m: Manifest = manifest;
		const i18nObj = configureI18n(context);

    const incident = {
        id: eventData.id
    }

    const payload: PostCreate = {
        message: "",
        channel_id: channelId,
        props: {
            app_bindings: [
                {
                    location: "embedded",
                    app_id: m.app_id,
										description: h6(i18nObj.__('api.webhook.binding.description', { link: hyperlink(`#${eventData.number} ${eventData.title}`, eventData.html_url) })),
                    bindings: [
                        {
                            location: ActionsEvents.ACKNOWLEDGED_ALERT_BUTTON_EVENT,
                            label: i18nObj.__('api.webhook.binding.label'),
                            submit: {
                                path: Routes.App.CallPathIncidentAcknowledgedAction,
                                expand: {
                                    oauth2_user: AppExpandLevels.EXPAND_ALL,
                                    oauth2_app: AppExpandLevels.EXPAND_ALL,
                                    post: AppExpandLevels.EXPAND_SUMMARY
                                },
                                state: {
                                    incident
                                }
                            }
                        },
                        {
                            location: ActionsEvents.CLOSE_ALERT_BUTTON_EVENT,
                            label: i18nObj.__('api.webhook.button_event'),
                            submit: {
                                path: Routes.App.CallPathIncidentResolveAction,
                                expand: {
                                    oauth2_user: AppExpandLevels.EXPAND_ALL,
                                    oauth2_app: AppExpandLevels.EXPAND_ALL,
                                    post: AppExpandLevels.EXPAND_SUMMARY
                                },
                                state: {
                                    incident
                                }
                            }
                        },
                        {
                            location: ActionsEvents.OTHER_OPTIONS_SELECT_EVENT,
                            label: i18nObj.__('api.webhook.select_event'),
                            bindings: [
                                {
                                    location: ActionsEvents.OTHER_INCIDENT_VIEW_DETAIL,
                                    label: i18nObj.__('api.webhook.select_event_details'),
                                    submit: {
                                        path: Routes.App.CallPathDetailViewIncidentAction,
                                        expand: {
                                            oauth2_user: AppExpandLevels.EXPAND_ALL,
                                            oauth2_app: AppExpandLevels.EXPAND_ALL,
                                            post: AppExpandLevels.EXPAND_SUMMARY
                                        },
                                        state: {
                                            incident
                                        }
                                    }
                                },
                                {
                                    location: ActionsEvents.OTHER_INCIDENT_ADD_NOTE,
                                    label: i18nObj.__('api.webhook.add_note'),
                                    submit: {
                                        path: Routes.App.CallPathNoteToIncidentAction,
                                        expand: {
                                            oauth2_user: AppExpandLevels.EXPAND_ALL,
                                            oauth2_app: AppExpandLevels.EXPAND_ALL,
                                            post: AppExpandLevels.EXPAND_SUMMARY
                                        },
                                        state: {
                                            incident
                                        }
                                    }
                                },
                                {
                                    location: ActionsEvents.OTHER_INCIDENT_CHANGE_PRIORITY,
                                    label: i18nObj.__('api.webhook.priority'),
                                    submit: {
                                        path: Routes.App.CallPathChangeIncidentPriorityAction,
                                        expand: {
                                            oauth2_user: AppExpandLevels.EXPAND_ALL,
                                            oauth2_app: AppExpandLevels.EXPAND_ALL,
                                            post: AppExpandLevels.EXPAND_SUMMARY
                                        },
                                        state: {
                                            incident
                                        }
                                    }
                                },
                                {
                                    location: ActionsEvents.OTHER_INCIDENT_REASSIGN,
                                    label: i18nObj.__('api.webhook.reassign'),
                                    submit: {
                                        path: Routes.App.CallPathAssignIncidentAction,
                                        expand: {
                                            oauth2_user: AppExpandLevels.EXPAND_ALL,
                                            oauth2_app: AppExpandLevels.EXPAND_ALL,
                                            post: AppExpandLevels.EXPAND_SUMMARY
                                        },
                                        state: {
                                            incident
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

async function notifyIncidentAnnotated({ data: { event }, rawQuery }: WebhookRequest<WebhookEvent<AddNoteWebhook>>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const eventData: AddNoteWebhook = event.data;
		const i18nObj = configureI18n(context);

    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);
    const channelId: string = <string>parsedQuery['channelId'];

    const payload: PostCreate = {
        message: '',
        channel_id: channelId,
        props: {
            attachments: [
                {
                    text: i18nObj.__('api.webhook.text_incident',
												{
														link: hyperlink(eventData.incident.summary, eventData.incident.html_url),
														html_url: hyperlink(event.agent.summary, event.agent.html_url),
														content: eventData.content
												})
                }
            ]
        }
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

async function notifyIncidentAcknowledged({ data: { event }, rawQuery }: WebhookRequest<WebhookEvent<EventWebhook>>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const eventData: EventWebhook = event.data;
		const i18nObj = configureI18n(context);

    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);
    const channelId: string = <string>parsedQuery['channelId'];

    const payload: PostCreate = {
        message: '',
        channel_id: channelId,
        props: {
            attachments: [
                {
                    text: i18nObj.__('api.webhook.text_binding',
												{
														link: hyperlink(`[#${eventData.number}] ${eventData.title}`, eventData.html_url),
														html_url: hyperlink(event.agent.summary, event.agent.html_url)
												})
                }
            ]
        }
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

async function notifyIncidentReassigned({ data: { event }, rawQuery }: WebhookRequest<WebhookEvent<EventWebhook>>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const eventData: EventWebhook = event.data;
		const i18nObj = configureI18n(context);

    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);
    const channelId: string = <string>parsedQuery['channelId'];

    const  assignees: string[] = eventData.assignees.map((assign) => hyperlink(assign.summary, assign.html_url));
    const payload: PostCreate = {
        message: '',
        channel_id: channelId,
        props: {
            attachments: [
                {
                    text: i18nObj.__('api.webhook.text_reassigned',
												{
														link: hyperlink(`[#${eventData.number}] ${eventData.title}`, eventData.html_url),
														assignees: assignees.join(', '),
														html_url: hyperlink(event.agent.summary, event.agent.html_url)
												})
                }
            ]
        }
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

async function notifyIncidentResolved({ data: { event }, rawQuery }: WebhookRequest<WebhookEvent<EventWebhook>>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const eventData: EventWebhook = event.data;
		const i18nObj = configureI18n(context);

    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);
    const channelId: string = <string>parsedQuery['channelId'];

    const payload: PostCreate = {
        message: '',
        channel_id: channelId,
        props: {
            attachments: [
                {
                    text: i18nObj.__('api.webhook.text_resolved',
												{
														link: hyperlink(`[#${eventData.number}] ${eventData.title}`, eventData.html_url),
														html_url: hyperlink(event.agent.summary, event.agent.html_url)
												})
                }
            ]
        }
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

async function notifyChangeIncidentPriority({ data: { event }, rawQuery }: WebhookRequest<WebhookEvent<EventWebhook>>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const eventData: EventWebhook = event.data;
		const i18nObj = configureI18n(context);

    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);
    const channelId: string = <string>parsedQuery['channelId'];

    const payload: PostCreate = {
        message: '',
        channel_id: channelId,
        props: {
            attachments: [
                {
                    text: i18nObj.__('api.webhook.text_updated',
												{
														link: hyperlink(`[#${eventData.number}] ${eventData.title}`, eventData.html_url),
														html_url: hyperlink(`${eventData.priority.summary}`, eventData.priority.html_url),
														agent_summary: hyperlink(event.agent.summary, event.agent.html_url)
												})
                }
            ]
        }
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

const WEBHOOKS_ACTIONS: { [key: string]: Function } = {
    'incident.triggered': notifyIncidentTriggered,
    'incident.annotated': notifyIncidentAnnotated,
    'incident.acknowledged': notifyIncidentAcknowledged,
    'incident.reassigned': notifyIncidentReassigned,
    'incident.resolved': notifyIncidentResolved,
    'incident.priority_updated': notifyChangeIncidentPriority
};

export const incomingWebhook = async (request: Request, response: Response) => {
    const webhookRequest: WebhookRequest<any> = request.body.values;
    const context: AppContext = request.body.context;
		const i18nObj = configureI18n(context);

    let callResponse: AppCallResponse;
    try {
        console.log('webhook', webhookRequest.data.event)
        const action: Function = WEBHOOKS_ACTIONS[webhookRequest.data.event.event_type];
        if (action) {
            await action(webhookRequest, context);
        }
        callResponse = newOKCallResponse();
        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage(i18nObj.__('api.webhook.error', { message: error.message }));
        response.json(callResponse);
    }
};
