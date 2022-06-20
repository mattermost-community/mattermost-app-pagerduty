import {AppBinding} from '../types';
import {AppExpandLevels, PagerDutyIcon, Routes, Commands} from '../constant';

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
