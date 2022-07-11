import {Request, Response} from 'express';
import manifest from '../manifest.json';
import {newOKCallResponseWithMarkdown} from '../utils/call-responses';
import {AppActingUser, AppCallRequest, AppCallResponse, ExpandedBotActingUser} from '../types';
import {addBulletSlashCommand, h5, joinLines} from '../utils/markdown';
import {KVStoreClient, KVStoreOptions} from "../clients/kvstore";
import {Commands} from "../constant";
import {existsKvTrelloConfig, isUserSystemAdmin} from "../utils/utils";

export const getHelp = async (request: Request, response: Response) => {
    const helpText: string = [
        getHeader(),
        await getCommands(request.body)
    ].join('');
    const callResponse: AppCallResponse = newOKCallResponseWithMarkdown(helpText);
    response.json(callResponse);
};

function getHeader(): string {
    return h5(`Mattermost PagerDuty Plugin - Slash Command Help`);
}

async function getCommands(call: AppCallRequest): Promise<String> {
    const homepageUrl: string = manifest.homepage_url;
    const context = call.context as ExpandedBotActingUser;
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const actingUser: AppActingUser | undefined = context.acting_user;
    const commands: string[] = [];

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvClient = new KVStoreClient(options);

    commands.push(addBulletSlashCommand(Commands.HELP, `Launch the PagerDuty plugin command line help syntax, check out the [documentation](${homepageUrl}).`));
    if (isUserSystemAdmin(<AppActingUser>actingUser)) {
        commands.push(addBulletSlashCommand(Commands.CONFIGURE, `Configure PagerDuty`));
    }
    if (await existsKvTrelloConfig(kvClient)) {
        commands.push(addBulletSlashCommand(Commands.INCIDENT, 'Create a new incidence.'));
        commands.push(addBulletSlashCommand(`${Commands.SUBSCRIPTION} add [Pager Duty Service ID] [Mattermost Channel]`, 'Add subscription of service to channel'));
        commands.push(addBulletSlashCommand(`${Commands.SUBSCRIPTION} list`, 'List subscriptions open'));
        commands.push(addBulletSlashCommand(`${Commands.SUBSCRIPTION} remove [SubscriptionId]`, 'Delete subscription of channel'));
        commands.push(addBulletSlashCommand(`${Commands.CONNECT}`, 'Connect your PagerDuty account'));
        commands.push(addBulletSlashCommand(`${Commands.DISCONNECT}`, 'Logout from your PagerDuty account'));
        commands.push(addBulletSlashCommand(`${Commands.ONCALL}`, 'Find out who is on call for a PagerDuty service.'));
        commands.push(addBulletSlashCommand(`${Commands.LIST} service`, 'Show all services from PagerDuty'))
        commands.push(addBulletSlashCommand(`${Commands.LIST} incident`, 'Show all incidents from PagerDuty'))
    }

    return `${joinLines(...commands)}`;
}
