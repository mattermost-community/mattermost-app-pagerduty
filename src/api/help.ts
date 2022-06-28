import {Request, Response} from 'express';
import manifest from '../manifest.json';
import {newOKCallResponseWithMarkdown} from "../utils/call-responses";
import {AppCallRequest, AppCallResponse, ExpandedBotActingUser} from "../types";
import {addBulletSlashCommand, h5, joinLines} from "../utils/markdown";
import { isUserSystemAdmin } from '../utils/utils';

export const getHelp = async (request: Request, response: Response) => {
    const helpText: string = [
        getHeader(),
        getCommands(request.body)
    ].join('');
    const callResponse: AppCallResponse = newOKCallResponseWithMarkdown(helpText);
    response.json(callResponse);
};

function getHeader(): string {
    return h5(`Mattermost PagerDuty Plugin - Slash Command Help`);
}

function getCommands(call: AppCallRequest): string {
    const context = call.context as ExpandedBotActingUser;

    return isUserSystemAdmin(context.acting_user)
        ? getAdminCommands()
        : getUserCommands();
}

function getUserCommands(): string {
    const homepageUrl: string = manifest.homepage_url;
    return `${joinLines(
        addBulletSlashCommand('help', `Launch the Jira plugin command line help syntax, check out the [documentation](${homepageUrl}).`),
        addBulletSlashCommand('connect', `Connect your PagerDuty account`),
        addBulletSlashCommand('disconnect', `Logout from your PagerDuty account`), 
        addBulletSlashCommand('subscription add [Pager Duty Service ID] [Mattermost Channel]', `Add subscription of service to channel`),
        addBulletSlashCommand('subscription delete [SubscriptionId]', `Delete subscription of channel`),
        addBulletSlashCommand('subscription list', `List subscriptions open`),
        addBulletSlashCommand('incident [create]', 'Trigger a new PagerDuty incident.'),
        addBulletSlashCommand('oncall', 'Find out who is on call for a PagerDuty service.'),
        addBulletSlashCommand('list service', 'Show all services from PagerDuty'),
        addBulletSlashCommand('list incident', 'Show all incidents from PagerDuty'),
    )}\n`;
}

function getAdminCommands(): string {
    const homepageUrl: string = manifest.homepage_url;
    return `${joinLines(
        addBulletSlashCommand('help', `Launch the PagerDuty plugin command line help syntax, check out the [documentation](${homepageUrl}).`),
        addBulletSlashCommand('configure', `Configure PagerDuty.`),
        addBulletSlashCommand('connect', `Connect your PagerDuty account`),
        addBulletSlashCommand('disconnect', `Logout from your PagerDuty account`),
        addBulletSlashCommand('subscription add [Pager Duty Service ID] [Mattermost Channel]', `Add subscription of service to channel`),
        addBulletSlashCommand('subscription delete [SubscriptionId]', `Delete subscription of channel`),
        addBulletSlashCommand('subscription list', `List subscriptions open`),
        addBulletSlashCommand('incident [create]', 'Trigger a new PagerDuty incident.'),
        addBulletSlashCommand('oncall', 'Find out who is on call for a PagerDuty service.'),
        addBulletSlashCommand('list service', 'Show all services from PagerDuty'),
        addBulletSlashCommand('list incident', 'Show all incidents from PagerDuty'),
    )}\n`;
}