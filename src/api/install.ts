import {Request, Response} from 'express';
import {AppCallRequest, AppCallResponse, AppContext} from '../types';
import {newOKCallResponseWithMarkdown} from '../utils/call-responses';
import manifest from '../manifest.json';
import {MattermostClient, MattermostOptions} from "../clients/mattermost";
import {joinLines} from "../utils/markdown";
import {configureI18n} from "../utils/translations";

export const getInstall = async (request: Request, response: Response) => {
    const call: AppCallRequest = request.body;

    const helpText: string = [
        getCommands(call.context)
    ].join('');
    const callResponse: AppCallResponse = newOKCallResponseWithMarkdown(helpText);

    response.json(callResponse);
};

function getCommands(context: AppContext): string {
		const i18nObj = configureI18n(context);

    const homepageUrl: string = manifest.homepage_url;
    return `${joinLines(i18nObj.__('api.install.text', { url: homepageUrl }))}\n`;
}
