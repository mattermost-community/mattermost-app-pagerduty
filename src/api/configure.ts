import {Request, Response} from "express";
import {CallResponseHandler, newOKCallResponseWithMarkdown} from '../utils/call-responses';
import {AppCallRequest, AppCallResponse} from '../types';
import {hyperlink} from '../utils/markdown';

export const connectAccountLoginSubmit: CallResponseHandler = async (req: Request, res: Response) => {
    const call: AppCallRequest = req.body;
    const connectUrl: string = call.context.oauth2.connect_url;

    const callResponse: AppCallResponse = newOKCallResponseWithMarkdown(`Follow this ${hyperlink('link', connectUrl)} to connect Mattermost to your PagerDuty Account.`);
    res.json(callResponse);
};

export const fOauth2Connect: CallResponseHandler = async (req:  Request, res: Response) => {
    console.log('fOauth2Connect', req.body);
}

export const fOauth2Complete: CallResponseHandler = async (req: Request, res: Response) => {
    console.log('fOauth2Complete', req.body);
}


