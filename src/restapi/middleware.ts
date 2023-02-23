import { Request, Response } from 'express';

import { ExceptionType } from '../constant';
import { AppActingUser, AppCallRequest, Oauth2App } from '../types';
import { Exception } from '../utils/exception';
import { configureI18n } from '../utils/translations';
import { isConnected, isUserSystemAdmin, showMessageToMattermost } from '../utils/utils';

export const requireSystemAdmin = (req: Request, res: Response, next: () => void) => {
    const call: AppCallRequest = req.body as AppCallRequest;
    const i18nObj = configureI18n(call.context);
    const actingUser: AppActingUser = call.context.acting_user as AppActingUser;

    if (!actingUser) {
        res.json(showMessageToMattermost(new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.not-provided'), i18nObj.__('general.validation-user.not-provided'), call)));
        return;
    }

    if (!isUserSystemAdmin(actingUser)) {
        res.json(showMessageToMattermost(new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.system-admin'), i18nObj.__('general.validation-user.system-admin'), call)));
        return;
    }

    next();
};

export const requireUserOAuthConnected = (req: Request, res: Response, next: () => void) => {
    const call: AppCallRequest = req.body as AppCallRequest;
    const i18nObj = configureI18n(call.context);
    const oauth2: Oauth2App | undefined = call.context.oauth2;
    if (!oauth2) {
        res.json(showMessageToMattermost(new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.oauth2-not-found'), i18nObj.__('general.validation-user.oauth2-not-found'), call)));
    }

    if (!isConnected(oauth2)) {
        res.json(showMessageToMattermost(new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.oauth-user'), i18nObj.__('general.validation-user.oauth-user'), call)));
        return;
    }

    next();
};

export const requireUserOAuthDisconnected = (req: Request, res: Response, next: () => void) => {
    const call: AppCallRequest = req.body as AppCallRequest;
    const i18nObj = configureI18n(call.context);
    const oauth2: Oauth2App | undefined = call.context.oauth2;
    if (!oauth2) {
        res.json(showMessageToMattermost(new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.oauth2-not-found'), i18nObj.__('general.validation-user.oauth2-not-found'), call)));
    }

    if (isConnected(oauth2)) {
        res.json(showMessageToMattermost(new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.oauth-user-already'), i18nObj.__('general.validation-user.oauth-user-already'), call)));
        return;
    }

    next();
};