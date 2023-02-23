import { AppActingUser, AppBinding, AppCallRequest, AppContext, AppsState, Oauth2App } from '../types';

import {
    AppBindingLocations,
    CommandTrigger,
    Commands,
    PagerDutyIcon,
} from '../constant';
import { existsOauth2AppConfig, isConnected, isUserSystemAdmin } from '../utils/utils';
import { configureI18n } from '../utils/translations';

import {
    accountLoginBinding,
    accountLogoutBinding,
    getConfigureBinding,
    getHelpBinding,
    getIncidentsBinding,
    listBinding,
    subscriptionBinding,
} from './bindings';

const newCommandBindings = (context: AppContext, bindings: AppBinding[], commands: string[]): AppsState => {
    const i18nObj = configureI18n(context);
    return {
        location: AppBindingLocations.COMMAND,
        bindings: [
            {
                icon: PagerDutyIcon,
                label: CommandTrigger,
                hint: `[${commands.join(' | ')}]`,
                description: i18nObj.__('bindings.slash.bindings'),
                bindings,
            },
        ],
    };
};

export const getCommandBindings = async (call: AppCallRequest): Promise<AppsState> => {
    const oauth2: Oauth2App | undefined = call.context.oauth2;
    const actingUser: AppActingUser | undefined = call.context.acting_user;
    const context = call.context as AppContext;

    const bindings: AppBinding[] = [];
    const commands: string[] = [
        Commands.HELP,
    ];

    bindings.push(getHelpBinding(context));

    if (isUserSystemAdmin(<AppActingUser>actingUser)) {
        bindings.push(getConfigureBinding(context));
        commands.push(Commands.CONFIGURE);
    }

    if (existsOauth2AppConfig(oauth2)) {
        if (isConnected(oauth2)) {
            commands.push(Commands.SUBSCRIPTION);
            commands.push(Commands.INCIDENT);
            commands.push(Commands.LIST);
            commands.push(Commands.DISCONNECT);
            bindings.push(subscriptionBinding(context));
            bindings.push(listBinding(context));
            bindings.push(getIncidentsBinding(context));
            bindings.push(accountLogoutBinding(context));
        } else {
            commands.push(Commands.CONNECT);
            bindings.push(accountLoginBinding(context));
        }
    }

    return newCommandBindings(context, bindings, commands);
};

