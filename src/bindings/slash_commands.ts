import {AppBinding, AppsState} from '../types';

import {createAlertBinding, getHelpBinding} from './bindings';
import {AppBindingLocations, Commands, CommandTrigger, PagerDutyIcon} from '../constant';

const newCommandBindings = (bindings: AppBinding[]): AppsState => {
    return {
        location: AppBindingLocations.COMMAND,
        bindings: [
            {
                icon: PagerDutyIcon,
                label: CommandTrigger,
                hint: `[${Commands.HELP} | ${Commands.INCIDENT}]`,
                description: 'Manage OpsGenie',
                bindings,
            },
        ],
    };
};

export const getCommandBindings = (): AppsState => {
    const bindings: AppBinding[] = [];

    bindings.push(getHelpBinding());
    bindings.push(createAlertBinding());
    return newCommandBindings(bindings);
};

