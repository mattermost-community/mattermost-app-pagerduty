import {AppActingUser, AppBinding, AppCallRequest, AppsState, Oauth2App} from '../types';

import {
    accountLoginBinding,
    accountLogoutBinding,
    getIncidentsBinding,
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
import {KVStoreClient, KVStoreOptions} from "../clients/kvstore";
import {existsKvTrelloConfig, isConnected, isUserSystemAdmin} from "../utils/utils";

const newCommandBindings = (bindings: AppBinding[], commands: string[]): AppsState => {
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

export const getCommandBindings = async (call: AppCallRequest): Promise<AppsState> => {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const oauth2: Oauth2App | undefined = call.context.oauth2;
    const actingUser: AppActingUser | undefined = call.context.acting_user;

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvClient = new KVStoreClient(options);

    const bindings: AppBinding[] = [];
    const commands: string[] = [
        Commands.HELP
    ];

    bindings.push(getHelpBinding());

    if (isUserSystemAdmin(<AppActingUser>actingUser)) {
        bindings.push(getConfigureBinding());
        commands.push(Commands.CONFIGURE);
    }
    if (await existsKvTrelloConfig(kvClient)) {
        if (isConnected(oauth2)) {
            commands.push(Commands.SUBSCRIPTION);
            commands.push(Commands.INCIDENT);
            commands.push(Commands.LIST);
            bindings.push(subscriptionBinding())
            bindings.push(listBinding());
            bindings.push(getIncidentsBinding());
        }

        commands.push(Commands.CONNECT);
        commands.push(Commands.DISCONNECT);
        bindings.push(accountLoginBinding());
        bindings.push(accountLogoutBinding());
    }

    return newCommandBindings(bindings, commands);
};

