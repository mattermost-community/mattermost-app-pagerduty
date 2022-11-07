import {AppBinding, AppContext} from '../types';
import {
    AppExpandLevels,
    PagerDutyIcon,
    Routes,
    Commands,
    SubscriptionCreateForm,
    AppFieldTypes,
    SubscriptionDeleteForm,
    CreateIncidentForm,
} from '../constant';
import {configureI18n} from "../utils/translations";

export const getHelpBinding = (context: AppContext): any => {
		const i18nObj = configureI18n(context);

    return {
        label: Commands.HELP,
        icon: PagerDutyIcon,
        description: i18nObj.__('bindings.bindings.help.description'),
        form: {
            title: i18nObj.__('bindings.bindings.help.title'),
            icon: PagerDutyIcon,
            submit: {
                path: Routes.App.BindingPathHelp,
                expand: {
                    acting_user: AppExpandLevels.EXPAND_ALL,
                    oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY
                }
            }
        }
    };
};

export const getIncidentsBinding = (context: AppContext) => {
		const i18nObj = configureI18n(context);

    return {
        icon: PagerDutyIcon,
        label: Commands.INCIDENT,
        description: i18nObj.__('bindings.bindings.incident.description'),
        hint: `[${Commands.CREATE}]`,
        bindings: [
            incidentCreateBinding(context),
        ]
    }
}

const incidentCreateBinding = (context: AppContext): AppBinding => {
		const i18nObj = configureI18n(context);

    return {
        label: Commands.CREATE,
        icon: PagerDutyIcon,
        description: i18nObj.__('bindings.bindings.create_incident.description'),
        form: {
            title: i18nObj.__('bindings.bindings.create_incident.title'),
            icon: PagerDutyIcon,
            submit: {
                path: `${Routes.App.CallPathForms}${Routes.App.CallPathIncidentCreate}`,
                expand: {
                    app: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_user: AppExpandLevels.EXPAND_SUMMARY
                }
            },
            fields: [
                {
                    type: AppFieldTypes.TEXT,
                    name: CreateIncidentForm.SERVICE,
                    modal_label: i18nObj.__('bindings.bindings.create_incident.modal_impacted_label'),
                    description: i18nObj.__('bindings.bindings.create_incident.modal_impacted_description'),
                },
                {
                    type: AppFieldTypes.TEXT,
                    name: CreateIncidentForm.TITLE,
                    modal_label: i18nObj.__('bindings.bindings.create_incident.modal_title_label'),
                    description: i18nObj.__('bindings.bindings.create_incident.modal_title_description'),
                },
                {
                    type: AppFieldTypes.TEXT,
                    name: CreateIncidentForm.DESCRIPTION,
                    modal_label: i18nObj.__('bindings.bindings.create_incident.modal_description_label'),
                    description: i18nObj.__('bindings.bindings.create_incident.modal_description_description'),
                },
                {
                    type: AppFieldTypes.TEXT,
                    name: CreateIncidentForm.ASSIGN_TO,
                    modal_label: i18nObj.__('bindings.bindings.create_incident.modal_assign_label'),
                    description: i18nObj.__('bindings.bindings.create_incident.modal_assign_description'),
                },
            ]
        }
    }
}

export const getConfigureBinding = (context: AppContext): any => {
		const i18nObj = configureI18n(context);

    return {
        icon: PagerDutyIcon,
        label: Commands.CONFIGURE,
        description: i18nObj.__('bindings.bindings.configure.description'),
        form: {
            title: i18nObj.__('bindings.bindings.configure.title'),
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

export const accountLoginBinding = (context: AppContext): any => {
		const i18nObj = configureI18n(context);

    return {
        icon: PagerDutyIcon,
        label: Commands.CONNECT,
        description: i18nObj.__('bindings.bindings.account_login.description'),
        form: {
            title: i18nObj.__('bindings.bindings.account_login.title'),
            icon: PagerDutyIcon,
            submit: {
                path: Routes.App.CallPathConnectSubmit,
                expand: {
                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_user: AppExpandLevels.EXPAND_SUMMARY
                }
            }
        }
    }
};

export const accountLogoutBinding = (context: AppContext): any => {
		const i18nObj = configureI18n(context);

    return {
        icon: PagerDutyIcon,
        label: Commands.DISCONNECT,
        description: i18nObj.__('bindings.bindings.account_logout.description'),
        form: {
            title: i18nObj.__('bindings.bindings.account_logout.title'),
            icon: PagerDutyIcon,
            submit: {
                path: Routes.App.CallPathDisconnectSubmit,
                expand: {
                    acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                    oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY
                }
            }
        }
    }
};

export const subscriptionBinding = (context: AppContext): AppBinding => {
		const i18nObj = configureI18n(context);

    const subCommands: string[] = [
        Commands.ADD,
        Commands.DELETE,
        Commands.LIST
    ];

    const bindings: AppBinding[] = [];

    bindings.push(subscriptionAddBinding(context));
    bindings.push(subscriptionDeleteBinding(context));
    bindings.push(subscriptionListBinding(context));

    return {
        icon: PagerDutyIcon,
        label: Commands.SUBSCRIPTION,
        description: i18nObj.__('bindings.bindings.subcription.description'),
        hint: `[${subCommands.join(' | ')}]`,
        bindings
    }
};

export const subscriptionAddBinding = (context: AppContext): any => {
		const i18nObj = configureI18n(context);

    return {
        icon: PagerDutyIcon,
        label: Commands.ADD,
        description: i18nObj.__('bindings.bindings.subcription.description'),
        form: {
            title: i18nObj.__('bindings.bindings.subcription.title'),
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
                    modal_label: i18nObj.__('bindings.bindings.subcription.modal_service'),
                    name: SubscriptionCreateForm.SERVICE_ID,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                    max_length: 100
                },
                {
                    modal_label: i18nObj.__('bindings.bindings.subcription.modal_channel'),
                    name: SubscriptionCreateForm.CHANNEL_ID,
                    type: AppFieldTypes.CHANNEL,
                    is_required: true,
                    position: 2
                }
            ]
        }
    }
};

export const subscriptionDeleteBinding = (context: AppContext): any => {
		const i18nObj = configureI18n(context);

    return {
        icon: PagerDutyIcon,
        label: Commands.DELETE,
        description: i18nObj.__('bindings.bindings.subcription.delete.description'),
        form: {
            title: i18nObj.__('bindings.bindings.subcription.delete.title'),
            icon: PagerDutyIcon,
            submit: {
                path: Routes.App.CallPathSubscriptionDeleteSubmit,
                expand: {
                    app: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_user: AppExpandLevels.EXPAND_SUMMARY
                },
            },
            fields: [
                {
                    modal_label: i18nObj.__('bindings.bindings.subcription.delete.label'),
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

export const subscriptionListBinding = (context: AppContext): any => {
		const i18nObj = configureI18n(context);

    return {
        icon: PagerDutyIcon,
        label: Commands.LIST,
        description: i18n,
        form: {
            title: i18nObj.__('bindings.bindings.subcription.list.description'),
            icon: PagerDutyIcon,
            submit: {
                path: Routes.App.CallPathSubscriptionListSubmit,
                expand: {
                    acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                    app: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_user: AppExpandLevels.EXPAND_SUMMARY
                }
            }
        }
    }
};

export const listBinding = (context: AppContext): AppBinding => {
		const i18nObj = configureI18n(context);

    const subCommands: string[] = [
        Commands.SERVICE,
        Commands.INCIDENT,
        Commands.ONCALL
    ];

    const bindings: AppBinding[] = [];

    bindings.push(serviceListBinding(context));
    bindings.push(incidentListBinding(context));
    bindings.push(onCallListBinding(context));

    return {
        icon: PagerDutyIcon,
        label: Commands.LIST,
        description: i18nObj.__('bindings.bindings.subcription.list.binding'),
        hint: `[${subCommands.join(' | ')}]`,
        bindings
    }
};

export const serviceListBinding = (context: AppContext): any => {
		const i18nObj = configureI18n(context);

    return {
        icon: PagerDutyIcon,
        label: Commands.SERVICE,
        description: i18nObj.__('bindings.bindings.subcription.service.title'),
        form: {
            title: i18nObj.__('bindings.bindings.subcription.service.title'),
            icon: PagerDutyIcon,
            submit: {
                path: Routes.App.CallPathServiceSubmit,
                expand: {
                    app: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_user: AppExpandLevels.EXPAND_SUMMARY
                }
            }
        }
    }
};

export const incidentListBinding = (context: AppContext): any => {
		const i18nObj = configureI18n(context);

    return {
        icon: PagerDutyIcon,
        label: Commands.INCIDENT,
        description: i18nObj.__('bindings.bindings.subcription.incidents.title'),
        form: {
            title: i18nObj.__('bindings.bindings.subcription.incidents.title'),
            icon: PagerDutyIcon,
            submit: {
                path: Routes.App.CallPathIncidentSubmit,
                expand: {
                    app: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_user: AppExpandLevels.EXPAND_SUMMARY
                }
            }
        }
    }
};

export const onCallListBinding = (context: AppContext): any => {
		const i18nObj = configureI18n(context);

    return {
        icon: PagerDutyIcon,
        label: Commands.ONCALL,
        description: i18nObj.__('bindings.bindings.subcription'),
        form: {
            title: i18nObj.__('bindings.bindings.subcription'),
            icon: PagerDutyIcon,
            submit: {
                path: Routes.App.CallPathOnCallSubmit,
                expand: {
                    app: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_user: AppExpandLevels.EXPAND_SUMMARY
                }
            }
        }
    }
};

