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
                    description: h6(`Triggered: ${hyperlink(`#${eventData.number} ${eventData.title}`, eventData.html_url)}`),
                    bindings: [
                        {
                            location: ActionsEvents.ACKNOWLEDGED_ALERT_BUTTON_EVENT,
                            label: 'Acknowledged',
                            submit: {
                                path: Routes.App.CallPathIncidentAcknowledgedAction,
                                expand: {
                                    oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
                                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                                    post: AppExpandLevels.EXPAND_SUMMARY
                                },
                                state: {
                                    incident
                                }
                            }
                        },
                        {
                            location: ActionsEvents.CLOSE_ALERT_BUTTON_EVENT,
                            label: 'Resolve',
                            submit: {
                                path: Routes.App.CallPathIncidentResolveAction,
                                expand: {
                                    oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
                                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                                    post: AppExpandLevels.EXPAND_SUMMARY
                                },
                                state: {
                                    incident
                                }
                            }
                        },
                        {
                            location: ActionsEvents.OTHER_OPTIONS_SELECT_EVENT,
                            label: "Other actions...",
                            bindings: [
                                {
                                    location: ActionsEvents.OTHER_INCIDENT_VIEW_DETAIL,
                                    label: "View details",
                                    submit: {
                                        path: Routes.App.CallPathDetailViewIncidentAction,
                                        expand: {
                                            oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
                                            oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                                            post: AppExpandLevels.EXPAND_SUMMARY
                                        },
                                        state: {
                                            incident
                                        }
                                    }
                                },
                                {
                                    location: ActionsEvents.OTHER_INCIDENT_ADD_NOTE,
                                    label: "Add note",
                                    submit: {
                                        path: Routes.App.CallPathNoteToIncidentAction,
                                        expand: {
                                            oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
                                            oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                                            post: AppExpandLevels.EXPAND_SUMMARY
                                        },
                                        state: {
                                            incident
                                        }
                                    }
                                },
                                {
                                    location: ActionsEvents.OTHER_INCIDENT_CHANGE_PRIORITY,
                                    label: "Change Priority",
                                    submit: {
                                        path: Routes.App.CallPathChangeIncidentPriorityAction,
                                        expand: {
                                            oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
                                            oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                                            post: AppExpandLevels.EXPAND_SUMMARY
                                        },
                                        state: {
                                            incident
                                        }
                                    }
                                },
                                {
                                    location: ActionsEvents.OTHER_INCIDENT_REASSIGN,
                                    label: "Reassign",
                                    submit: {
                                        path: Routes.App.CallPathAssignIncidentAction,
                                        expand: {
                                            oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
                                            oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
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

    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);
    const channelId: string = <string>parsedQuery['channelId'];

    const payload: PostCreate = {
        message: '',
        channel_id: channelId,
        props: {
            attachments: [
                {
                    text: `Note added to ${hyperlink(eventData.incident.summary, eventData.incident.html_url)} by ${hyperlink(event.agent.summary, event.agent.html_url)} \n "${eventData.content}"`
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

    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);
    const channelId: string = <string>parsedQuery['channelId'];

    const payload: PostCreate = {
        message: '',
        channel_id: channelId,
        props: {
            attachments: [
                {
                    text: `Acknowledged ${hyperlink(`[#${eventData.number}] ${eventData.title}`, eventData.html_url)} by ${hyperlink(event.agent.summary, event.agent.html_url)}`
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

    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);
    const channelId: string = <string>parsedQuery['channelId'];

    const  assignees: string[] = eventData.assignees.map((assign) => hyperlink(assign.summary, assign.html_url));
    const payload: PostCreate = {
        message: '',
        channel_id: channelId,
        props: {
            attachments: [
                {
                    text: `Reassigned ${hyperlink(`[#${eventData.number}] ${eventData.title}`, eventData.html_url)} to ${assignees.join(', ')} by ${hyperlink(event.agent.summary, event.agent.html_url)}`
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

    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);
    const channelId: string = <string>parsedQuery['channelId'];

    const payload: PostCreate = {
        message: '',
        channel_id: channelId,
        props: {
            attachments: [
                {
                    text: `Resolved ${hyperlink(`[#${eventData.number}] ${eventData.title}`, eventData.html_url)} by ${hyperlink(event.agent.summary, event.agent.html_url)}`
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

    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);
    const channelId: string = <string>parsedQuery['channelId'];

    const payload: PostCreate = {
        message: '',
        channel_id: channelId,
        props: {
            attachments: [
                {
                    text: `Updated ${hyperlink(`[#${eventData.number}] ${eventData.title}`, eventData.html_url)} priority to ${hyperlink(`${eventData.priority.summary}`, eventData.priority.html_url)} by ${hyperlink(event.agent.summary, event.agent.html_url)}`
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
        callResponse = newErrorCallResponseWithMessage('Error webhook: ' + error.message);
        response.json(callResponse);
    }
};
