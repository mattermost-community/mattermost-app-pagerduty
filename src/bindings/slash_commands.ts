import {AppActingUser, AppBinding, AppCallRequest, AppContext, AppsState, Oauth2App} from '../types';

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
import {existsKvPagerDutyConfig, isConnected, isUserSystemAdmin} from "../utils/utils";
import { configureI18n } from '../utils/translations';

const newCommandBindings = (context: AppContext, bindings: AppBinding[], commands: string[]): AppsState => {
    const i18nObj = configureI18n(context);
    return {
        location: AppBindingLocations.COMMAND,
        bindings: [
            {
                icon: PagerDutyIcon,
                label: CommandTrigger,
                hint: `[${commands.join(' | ')}]`,
                description: i18nObj.__('bindings-descriptions.bindings'),
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
    const context = call.context as AppContext;

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
    
    if (await existsKvPagerDutyConfig(kvClient)) {
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

    return newCommandBindings(context, bindings, commands);
};

