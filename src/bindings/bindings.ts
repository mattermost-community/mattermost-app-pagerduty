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

