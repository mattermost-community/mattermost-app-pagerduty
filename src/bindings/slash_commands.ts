import {AppBinding, AppsState} from '../types';

import {
    connectAccountBinding,
    createAlertBinding,
    getHelpBinding
} from './bindings';
import {
    AppBindingLocations,
    Commands,
    CommandTrigger,
    PagerDutyIcon
} from '../constant';

const newCommandBindings = (bindings: AppBinding[]): AppsState => {
    const commands: string[] = [
        Commands.HELP,
        Commands.ACCOUNT,
        Commands.INCIDENT
    ];

    return {
        location: AppBindingLocations.COMMAND,
        bindings: [
            {
                icon: PagerDutyIcon,
                label: CommandTrigger,
                hint: `[${commands.join(' | ')}]`,
                description: 'Manage OpsGenie',
                bindings,
            },
        ],
    };
};

export const getCommandBindings = (): AppsState => {
    const bindings: AppBinding[] = [];

    bindings.push(getHelpBinding());
    bindings.push(connectAccountBinding());
    bindings.push(createAlertBinding());
    return newCommandBindings(bindings);
};

