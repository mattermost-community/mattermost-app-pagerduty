import {Request, Response} from 'express';
import queryString, {ParsedQuery} from 'query-string';
import {
    AcknowledgedWebhook,
    AddNoteWebhook,
    AppCallResponse,
    AppContext,
    AppContextAction, Incident,
    IncidentWebhook,
    PostCreate, ReassignedWebhook,
    WebhookEvent,
    WebhookRequest
} from '../types';
import {newErrorCallResponseWithMessage, newOKCallResponse} from '../utils/call-responses';
import {ActionsEvents, options_alert} from '../constant';
import {MattermostClient, MattermostOptions} from '../clients/mattermost';
import config from '../config';
import {Routes} from '../constant'
import {hyperlink} from '../utils/markdown';
import {replace, toTitleCase} from '../utils/utils';
import {APIResponse, PartialCall} from "@pagerduty/pdjs/build/src/api";
import {api} from "@pagerduty/pdjs";

async function notifyIncidentTriggered({ data: { event }, rawQuery }: WebhookRequest<WebhookEvent<IncidentWebhook>>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const eventData: IncidentWebhook = event.data;

    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);
    const channelId: string = <string>parsedQuery['channelId'];

    const assignees: string[] = eventData.assignees.map((assignee) => hyperlink(assignee.summary, assignee.html_url));
    const payload: PostCreate = {
        message: '',
        channel_id: channelId,
        props: {
            attachments: [
                {
                    title: `Triggered: ${hyperlink(`#${eventData.number} ${eventData.title}`, eventData.html_url)}`,
                    text: `${toTitleCase(eventData.urgency)} Urgency`,
                    title_link: '',
                    fields: [
                        {
                            short: true,
                            title: 'Assigned',
                            value: assignees.join(', ')
                        },
                        {
                            short: true,
                            title: 'Service',
                            value: hyperlink(eventData.service.summary, eventData.service.html_url)
                        }
                    ],
                    actions: [
                        {
                            id: ActionsEvents.ACKNOWLEDGED_ALERT_BUTTON_EVENT,
                            name: 'Acknowledged',
                            type: 'button',
                            style: 'default',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathIncidentAcknowledgedAction}`,
                                context: {
                                    action: ActionsEvents.ACKNOWLEDGED_ALERT_BUTTON_EVENT,
                                    incident: {
                                        id: eventData.id
                                    },
                                    bot_access_token: botAccessToken,
                                    mattermost_site_url: mattermostUrl
                                } as AppContextAction
                            }
                        },
                        {
                            id: ActionsEvents.CLOSE_ALERT_BUTTON_EVENT,
                            name: 'Close',
                            type: 'button',
                            style: 'success',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathIncidentResolveAction}`,
                                context: {
                                    action: ActionsEvents.CLOSE_ALERT_BUTTON_EVENT,
                                    incident: {
                                        id: eventData.id
                                    },
                                    bot_access_token: botAccessToken,
                                    mattermost_site_url: mattermostUrl
                                } as AppContextAction
                            }
                        },
                        {
                            id: ActionsEvents.OTHER_OPTIONS_SELECT_EVENT,
                            name: 'Other actions...',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathIncidentOtherActions}`,
                                context: {
                                    action: ActionsEvents.OTHER_OPTIONS_SELECT_EVENT,
                                    incident: {
                                        id: eventData.id
                                    },
                                    bot_access_token: botAccessToken,
                                    mattermost_site_url: mattermostUrl
                                } as AppContextAction
                            },
                            type: 'select',
                            options: options_alert
                        }
                    ]
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

async function notifyIncidentAnnotated({ data: { event }, rawQuery }: WebhookRequest<WebhookEvent<AddNoteWebhook>>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const eventData: AddNoteWebhook = event.data;

    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);
    const channelId: string = <string>parsedQuery['channelId'];

    const pdClient: PartialCall = api({ token: 'u+Xfr4svUs-Q5fVDSx_w', tokenType: 'token' });
    const responseIncident: APIResponse = await pdClient.get(replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, eventData.incident.id));
    const incident: Incident = responseIncident.data['incident'];

    const payload: PostCreate = {
        message: '',
        channel_id: channelId,
        props: {
            attachments: [
                {
                    text: `Note added to ${hyperlink(incident.summary, incident.html_url)} by ${hyperlink(event.agent.summary, event.agent.html_url)} \n "${eventData.content}"`
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

async function notifyIncidentAcknowledged({ data: { event }, rawQuery }: WebhookRequest<WebhookEvent<AcknowledgedWebhook>>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const eventData: AcknowledgedWebhook = event.data;

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

async function notifyIncidentReassigned({ data: { event }, rawQuery }: WebhookRequest<WebhookEvent<ReassignedWebhook>>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const eventData: AcknowledgedWebhook = event.data;

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

const WEBHOOKS_ACTIONS: { [key: string]: Function } = {
    'incident.triggered': notifyIncidentTriggered,
    'incident.annotated': notifyIncidentAnnotated,
    'incident.acknowledged': notifyIncidentAcknowledged,
    'incident.reassigned': notifyIncidentReassigned
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
