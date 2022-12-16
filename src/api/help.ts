import { Request, Response } from 'express';

import manifest from '../manifest.json';
import { newOKCallResponseWithMarkdown } from '../utils/call-responses';
import { AppActingUser, AppCallRequest, AppCallResponse, AppContext, ExpandedBotActingUser, Oauth2App } from '../types';
import { addBulletSlashCommand, h5, joinLines } from '../utils/markdown';
import { KVStoreClient, KVStoreOptions } from '../clients/kvstore';
import { Commands } from '../constant';
import { configureI18n } from '../utils/translations';
import { existsOauth2AppConfig, isConnected, isUserSystemAdmin } from '../utils/utils';

export const getHelp = async (request: Request, response: Response) => {
    const call: AppCallRequest = request.body;

    const helpText: string = [
        getHeader(call.context),
        await getCommands(request.body),
    ].join('');
    const callResponse: AppCallResponse = newOKCallResponseWithMarkdown(helpText);
    response.json(callResponse);
};

function getHeader(context: AppContext): string {
    const i18nObj = configureI18n(context);

    return h5(i18nObj.__('api.help.text'));
}

async function getCommands(call: AppCallRequest): Promise<string> {
    const homepageUrl: string = manifest.homepage_url;
    const context = call.context as ExpandedBotActingUser;
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const oauth2: Oauth2App | undefined = context.oauth2;
    const actingUser: AppActingUser | undefined = context.acting_user;
    const commands: string[] = [];
    const i18nObj = configureI18n(call.context);

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvClient = new KVStoreClient(options);

    commands.push(addBulletSlashCommand(Commands.HELP, i18nObj.__('api.help.command_help', { url: homepageUrl })));
    if (isUserSystemAdmin(<AppActingUser>actingUser)) {
        commands.push(addBulletSlashCommand(Commands.CONFIGURE, i18nObj.__('api.help.command_configure')));
    }
    if (existsOauth2AppConfig(oauth2)) {
        if (isConnected(oauth2)) {
            commands.push(addBulletSlashCommand(`${Commands.INCIDENT}`, i18nObj.__('api.help.command_incident')));
            commands.push(addBulletSlashCommand(i18nObj.__('api.help.command_subcription', { command: Commands.SUBSCRIPTION }), i18nObj.__('api.help.command_subcription_description')));
            commands.push(addBulletSlashCommand(i18nObj.__('api.help.command_subcription_list'), i18nObj.__('api.help.command_subcription_list_description')));
            commands.push(addBulletSlashCommand(i18nObj.__('api.help.command_subcription_remove', { command: Commands.SUBSCRIPTION }), i18nObj.__('api.help.command_subcription_remove_description')));
            commands.push(addBulletSlashCommand(`${Commands.ONCALL}`, i18nObj.__('api.help.command_oncall')));
            commands.push(addBulletSlashCommand(i18nObj.__('api.help.command_service', { command: Commands.SERVICE }), i18nObj.__('api.help.command_service_description')));
            commands.push(addBulletSlashCommand(i18nObj.__('api.help.command_list'), i18nObj.__('api.help.command_list_description')));
        }

        commands.push(addBulletSlashCommand(`${Commands.CONNECT}`, i18nObj.__('api.help.command_connect')));
        commands.push(addBulletSlashCommand(`${Commands.DISCONNECT}`, i18nObj.__('api.help.command_disconnect')));
    }

    return `${joinLines(...commands)}`;
}
