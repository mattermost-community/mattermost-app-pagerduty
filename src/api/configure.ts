import {Request, Response} from 'express';
import {
    CallResponseHandler,
    newErrorCallResponseWithMessage,
    newFormCallResponse,
    newOKCallResponse,
    newOKCallResponseWithData,
    newOKCallResponseWithMarkdown
} from '../utils/call-responses';
import {AppCallRequest, AppCallResponse, Oauth2CurrentUser} from '../types';
import {hyperlink} from '../utils/markdown';
import {pagerDutyConfigForm, pagerDutyConfigSubmit} from '../forms/configure-admin-account';
import {oauth2Connect, oauth2Complete} from '../forms/oauth';

export const configureAdminAccountForm: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: AppCallResponse;

    try {
        const form = await pagerDutyConfigForm(req.body);
        callResponse = newFormCallResponse(form);
        res.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open configuration form: ' + error.message);
        res.json(callResponse);
    }
};

export const configureAdminAccountSubmit: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: AppCallResponse;

    try {
        await pagerDutyConfigSubmit(req.body);
        callResponse = newOKCallResponseWithMarkdown('Successfully updated PagerDuty configuration');
        res.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Error processing form request: ' + error.message);
        res.json(callResponse);
    }
};

export const connectAccountLoginSubmit: CallResponseHandler = async (req: Request, res: Response) => {
    const call: AppCallRequest = req.body;
    const connectUrl: string | undefined = call.context.oauth2?.connect_url;
    const currentUser: Oauth2CurrentUser | undefined = call.context.oauth2?.user;
    const message: string = currentUser
        ? `You are already logged into PagerDuty with user ${currentUser.user.name}`
        : `Follow this ${hyperlink('link', <string>connectUrl)} to connect Mattermost to your PagerDuty Account.`;
    const callResponse: AppCallResponse = newOKCallResponseWithMarkdown(message);
    res.json(callResponse);
};

export const fOauth2Connect: CallResponseHandler = async (req:  Request, res: Response) => {
    let callResponse: AppCallResponse;

    try {
        const url: string = await oauth2Connect(req.body);
        callResponse = newOKCallResponseWithData(url);
        res.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open configuration form: ' + error.message);
        res.json(callResponse);
    }
}

export const fOauth2Complete: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: AppCallResponse;

    try {
        await oauth2Complete(req.body);
        callResponse = newOKCallResponse();
        res.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage(error.message);
        res.json(callResponse);
    }
}

export const fOauth2Disconnect: CallResponseHandler = async (req, res) => {
    const call: AppCallRequest = req.body;
    console.log('call', call);
}


