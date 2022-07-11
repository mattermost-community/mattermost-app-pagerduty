import {AppBinding, AppsState} from '../types';

import {
    accountLoginBinding,
    accountLogoutBinding,
    createAlertBinding,
    getConfigureBinding,
    getHelpBinding,
    listBinding,
    subscriptionBinding
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
        Commands.CONFIGURE,
        Commands.CONNECT,
        Commands.DISCONNECT,
        Commands.SUBSCRIPTION,
        Commands.INCIDENT,
        Commands.LIST
    ];

    return {
        location: AppBindingLocations.COMMAND,
        bindings: [
            {
                icon: PagerDutyIcon,
                label: CommandTrigger,
                hint: `[${commands.join(' | ')}]`,
                description: 'Manage PagerDuty',
                bindings,
            },
        ],
    };
};

export const getCommandBindings = (): AppsState => {
    const bindings: AppBinding[] = [];

    bindings.push(getHelpBinding());
    bindings.push(getConfigureBinding());
    bindings.push(accountLoginBinding());
    bindings.push(accountLogoutBinding());
    bindings.push(subscriptionBinding())
    bindings.push(createAlertBinding());
    bindings.push(listBinding());
    return newCommandBindings(bindings);
};

