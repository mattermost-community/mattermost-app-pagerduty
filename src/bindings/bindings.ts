import {AppBinding} from '../types';
import {
    AppExpandLevels,
    PagerDutyIcon,
    Routes,
    Commands,
    SubscriptionCreateForm,
    AppFieldTypes,
    SubscriptionDeleteForm
} from '../constant';

export const getHelpBinding = (): any => {
    return {
        label: Commands.HELP,
        icon: PagerDutyIcon,
        description: 'Show PagerDuty Help',
        form: {
            title: "Show PagerDuty Help Title",
            icon: PagerDutyIcon,
            submit: {
                path: Routes.App.BindingPathHelp,
                expand: {}
            }
        }
    };
};

export const createAlertBinding = (): AppBinding => {
    return {
        label: Commands.INCIDENT,
        icon: PagerDutyIcon,
        description: 'Create incident in PagerDuty',
        form: {
            title: "Show PagerDuty Help Title",
            icon: PagerDutyIcon,
            submit: {
                path: Routes.App.CallPathIncidentCreate,
                expand: {
                    channel: AppExpandLevels.EXPAND_ALL
                }
            },
            fields: [
                {
                    name: 'message',
                    type: 'text',
                    is_required: true,
                    position: 1
                }
            ]
        }
    }
}

export const getConfigureBinding = (): any => {
    return {
        icon: PagerDutyIcon,
        label: Commands.CONFIGURE,
        description: 'Setup PagerDuty Admin Account',
        form: {
            title: "Setup PagerDuty",
            icon: PagerDutyIcon,
            submit: {
                path: Routes.App.CallPathConfigForm,
                expand: {
                    admin_access_token: AppExpandLevels.EXPAND_SUMMARY,
                    acting_user: AppExpandLevels.EXPAND_SUMMARY,
                    acting_user_access_token: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
                    app: AppExpandLevels.EXPAND_SUMMARY,
                }
            }
        }
    }
};

export const connectAccountBinding = (): any => {
    const subCommands: string[] = [
        Commands.LOGIN,
        Commands.LOGOUT
    ];

    const bindings: AppBinding[] = [];

    bindings.push(accountLoginBinding());
    bindings.push(accountLogoutBinding());

    return {
        icon: PagerDutyIcon,
        label: Commands.ACCOUNT,
        description: 'Connect your PagerDuty account',
        hint: `[${subCommands.join(' | ')}]`,
        bindings
    }
};

export const accountLoginBinding = (): any => {
    return {
        icon: PagerDutyIcon,
        label: Commands.LOGIN,
        description: 'Connect your PagerDuty account',
        form: {
            title: "Account login",
            icon: PagerDutyIcon,
            submit: {
                path: Routes.App.CallPathConnectSubmit,
                expand: {
                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY
                }
            }
        }
    }
};

export const accountLogoutBinding = (): any => {
    return {
        icon: PagerDutyIcon,
        label: Commands.LOGIN,
        description: 'Connect your PagerDuty account',
        form: {
            title: "Account logout",
            icon: PagerDutyIcon,
            submit: {
                path: Routes.App.CallPathConnectSubmit,
                expand: {
                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY
                }
            }
        }
    }
};

export const subscriptionBinding = (): AppBinding => {
    const subCommands: string[] = [
        Commands.ADD,
        Commands.DELETE,
        Commands.LIST
    ];

    const bindings: AppBinding[] = [];

    bindings.push(subscriptionAddBinding());
    bindings.push(subscriptionDeleteBinding());
    bindings.push(subscriptionListBinding());

    return {
        icon: PagerDutyIcon,
        label: Commands.SUBSCRIPTION,
        description: 'Subscription teams of PagerDuty to Mattermost channel',
        hint: `[${subCommands.join(' | ')}]`,
        bindings
    }
};

export const subscriptionAddBinding = (): any => {
    return {
        icon: PagerDutyIcon,
        label: Commands.ADD,
        description: 'Add a service subscription to a channel',
        form: {
            title: "Add a service subscription to a channel",
            icon: PagerDutyIcon,
            submit: {
                path: Routes.App.CallPathSubscriptionAddSubmit,
                expand: {
                    app: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
                }
            },
            fields: [
                {
                    modal_label: 'Service id',
                    name: SubscriptionCreateForm.SERVICE_ID,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                    max_length: 100
                },
                {
                    modal_label: 'Channel',
                    name: SubscriptionCreateForm.CHANNEL_ID,
                    type: AppFieldTypes.CHANNEL,
                    is_required: true,
                    position: 2
                }
            ]
        }
    }
};

export const subscriptionDeleteBinding = (): any => {
    return {
        icon: PagerDutyIcon,
        label: Commands.DELETE,
        description: 'Unsubscribe service from channel',
        form: {
            title: "Unsubscribe service from channel",
            icon: PagerDutyIcon,
            submit: {
                path: Routes.App.CallPathSubscriptionDeleteSubmit,
                expand: {
                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY
                },
            },
            fields: [
                {
                    modal_label: 'Subscription ID',
                    name: SubscriptionDeleteForm.SUBSCRIPTION_ID,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                    max_length: 36,
                    min_length: 36
                }
            ]
        }
    }
};

export const subscriptionListBinding = (): any => {
    return {
        icon: PagerDutyIcon,
        label: Commands.LIST,
        description: 'List of service subscribed to channels',
        form: {
            title: "List of service subscribed to channels",
            icon: PagerDutyIcon,
            submit: {
                path: Routes.App.CallPathSubscriptionListSubmit,
                expand: {
                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY
                }
            }
        }
    }
};

export const listBinding = (): AppBinding => {
    const subCommands: string[] = [
        Commands.SERVICE
    ];

    const bindings: AppBinding[] = [];

    bindings.push(serviceListBinding());

    return {
        icon: PagerDutyIcon,
        label: Commands.LIST,
        description: 'List PagerDuty',
        hint: `[${subCommands.join(' | ')}]`,
        bindings
    }
};


export const serviceListBinding = (): any => {
    return {
        icon: PagerDutyIcon,
        label: Commands.SERVICE,
        description: 'List of services',
        form: {
            title: "List of services",
            icon: PagerDutyIcon,
            submit: {
                path: Routes.App.CallPathServiceSubmit,
                expand: {}
            }
        }
    }
};

