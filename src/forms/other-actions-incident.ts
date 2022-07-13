import {
    AppCallAction,
    AppCallResponse,
    AppContextAction,
    AppSelectOption,
    AttachmentOption,
    DialogProps,
    PostCreate,
} from '../types';
import {MattermostClient, MattermostOptions} from '../clients/mattermost';
import {
    ActionsEvents,
    Routes,
    NoteModalForm,
    option_incident_add_note,
    option_incident_change_priority,
    option_incident_reassign,
    PagerDutyIconRoute
} from '../constant';
import config from '../config';
import { PagerDutyClient, PagerDutyOptions } from '../clients/pagerduty';
import { getUsersAttachmentOptionList, getUsersOptionList } from './pagerduty-options';

const ACTIONS_EVENT: { [key: string]: Function | { [key: string]: Function } } = {
    [ActionsEvents.OTHER_OPTIONS_SELECT_EVENT]: {
        [option_incident_add_note]: showModalNoteToIncident,
        [option_incident_change_priority]: showModalChangeIncidentPriority,
        [option_incident_reassign]: showPostOfListUsers,
    }
};

export async function otherActionsIncidentCall(call: AppCallAction<AppContextAction>): Promise<void> {
    const action: string = call.context.action;
    const selectedOption: string | undefined = call.context.selected_option;

    const handle: Function | { [key: string]: Function } = ACTIONS_EVENT[action];
    if (handle && typeof handle === 'object') {
        const subHandle: Function = handle[<string>selectedOption];
        if (subHandle) {
            await subHandle(call);
        }
    } else if (handle && typeof handle === 'function') {
        await handle(call);
    }
}

async function showModalNoteToIncident(call: AppCallAction<AppContextAction>): Promise<void> {
    const mattermostUrl: string = call.context.mattermost_site_url;
    const triggerId: string = call.trigger_id;
    const accessToken: string = call.context.bot_access_token;

    const mattermostOptions: MattermostOptions = {
        mattermostUrl,
        accessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    const dialogProps: DialogProps = {
        trigger_id: triggerId,
        url: `${config.APP.HOST}${Routes.App.CallPathNoteToIncidentAction}`,
        dialog: {
            title: 'Add Note',
            icon_url: PagerDutyIconRoute,
            submit_label: 'Add',
            state: JSON.stringify(call.context),
            elements: [
                {
                    display_name: 'Note',
                    type: 'textarea',
                    name: NoteModalForm.NOTE_MESSAGE,
                    placeholder: 'Your note here...',
                    optional: false,
                    max_length: 25000
                }
            ],
        }
    };
    await mattermostClient.showDialog(dialogProps);
}

async function showModalChangeIncidentPriority(call: AppCallAction<AppContextAction>): Promise<void> {
    const mattermostUrl: string = call.context.mattermost_site_url;
    const triggerId: string = call.trigger_id;
    const accessToken: string = call.context.bot_access_token;

    const mattermostOptions: MattermostOptions = {
        mattermostUrl,
        accessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    const dialogProps: DialogProps = {
        trigger_id: triggerId,
        url: `${config.APP.HOST}${Routes.App.CallPathChangeIncidentPriorityAction}`,
        dialog: {
            title: 'Add Note',
            icon_url: PagerDutyIconRoute,
            submit_label: 'Add',
            state: JSON.stringify(call.context),
            elements: [
                {
                    display_name: 'Note',
                    type: 'textarea',
                    name: NoteModalForm.NOTE_MESSAGE,
                    placeholder: 'Your note here...',
                    optional: false,
                    max_length: 25000
                }
            ],
        }
    };
    await mattermostClient.showDialog(dialogProps);
} 

async function showPostOfListUsers(call: AppCallAction<AppContextAction>): Promise<void> {
    const mattermostUrl: string = call.context.mattermost_site_url;
    const channelId: string = call.channel_id;
    const user_id: string = call.user_id;
    const accessToken: string = call.context.bot_access_token;
    const incident: any = call.context.incident;
    const mattermostOptions: MattermostOptions = {
        mattermostUrl,
        accessToken: <string>accessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    const pdOpt: PagerDutyOptions = {
        api_token: '',
        user_email: 'lizeth.garcia@ancient.mx'
    }

    const options_users: AttachmentOption[] = await getUsersAttachmentOptionList(pdOpt);

    const post: PostCreate = {
        channel_id: channelId,
        message: '',
        props: {
            attachments: [
                {
                    title: `Choose a user to assign the incident to`,
                    actions: [
                        {
                            id: ActionsEvents.USER_SELECT_EVENT,
                            name: "Choose a user",
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathAssignIncidentAction}`,
                                context: {
                                    action: ActionsEvents.USER_SELECT_EVENT,
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl,
                                    incident
                                } as AppContextAction
                            },
                            type: 'select',
                            options: options_users
                        },
                        {
                            id: ActionsEvents.CANCEL_BUTTON_EVENT,
                            name: 'Close',
                            type: 'button',
                            style: 'default',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathIncidentCloseOptions}`,
                                context: {
                                    action: ActionsEvents.CANCEL_BUTTON_EVENT,
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl
                                } as AppContextAction
                            }
                        }
                    ]
                }
            ]
        }
    };

    await mattermostClient.createPost(post);
}
