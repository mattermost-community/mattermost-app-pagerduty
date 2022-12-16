import { Request, Response } from 'express';

import {
    CallResponseHandler,
    newErrorCallResponseWithMessage,
    newFormCallResponse,
    newOKCallResponse,
    newOKCallResponseWithData,
    newOKCallResponseWithMarkdown,
} from '../utils/call-responses';
import { AppCallRequest, AppCallResponse, Oauth2App } from '../types';
import { hyperlink } from '../utils/markdown';
import { pagerDutyConfigForm, pagerDutyConfigSubmit } from '../forms/configure-admin-account';
import { oauth2Complete, oauth2Connect, oauth2Disconnect } from '../forms/oauth';
import { isConnected, showMessageToMattermost } from '../utils/utils';
import { configureI18n } from '../utils/translations';

export const configureAdminAccountForm: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: AppCallResponse;
    const call: AppCallRequest = req.body;
    const i18nObj = configureI18n(call.context);

    try {
        const form = await pagerDutyConfigForm(call);
        callResponse = newFormCallResponse(form);
        res.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage(i18nObj.__('api.configure.error_admin_account', { message: error.message }));
        res.json(callResponse);
    }
};

export const configureAdminAccountSubmit: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: AppCallResponse;
    const call: AppCallRequest = req.body;
    const i18nObj = configureI18n(call.context);

    try {
        const message = await pagerDutyConfigSubmit(call);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage(i18nObj.__('api.configure.configure_admin_account_error', { message: error.message }));
    }

    res.json(callResponse);
};

export const connectAccountLoginSubmit: CallResponseHandler = async (req: Request, res: Response) => {
    const call: AppCallRequest = req.body;
    const i18nObj = configureI18n(call.context);
    const connectUrl: string | undefined = call.context.oauth2?.connect_url;
    const oauth2: Oauth2App | undefined = call.context.oauth2;
    const message: string = isConnected(oauth2) ?
        i18nObj.__('api.configure.connect_account_login', { user: oauth2.user!.user.name.toString() }) :
        i18nObj.__('api.configure.follow_account_login', { url: hyperlink('link', <string>connectUrl) });
    const callResponse: AppCallResponse = newOKCallResponseWithMarkdown(message);
    res.json(callResponse);
};

export const fOauth2Connect: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: AppCallResponse;
    const call: AppCallRequest = req.body;
    const i18nObj = configureI18n(call.context);

    try {
        const url: string = await oauth2Connect(req.body);
        callResponse = newOKCallResponseWithData(url);
        res.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage(i18nObj.__('api.configure.error_connect', { message: error.message }));
        res.json(callResponse);
    }
};

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
};

export const fOauth2Disconnect: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: AppCallResponse;
    const call: AppCallRequest = req.body;
    const i18nObj = configureI18n(call.context);

    try {
        await oauth2Disconnect(req.body);
        callResponse = newOKCallResponseWithMarkdown(i18nObj.__('api.configure.disconnect'));
        res.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        res.json(callResponse);
    }
};

