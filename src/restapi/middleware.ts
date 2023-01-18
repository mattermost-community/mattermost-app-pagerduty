import { Request, Response } from 'express';

import { ExceptionType } from '../constant';
import { AppCallRequest, AppActingUser, Oauth2App } from '../types';
import { Exception } from '../utils/exception';
import { configureI18n } from '../utils/translations';
import { showMessageToMattermost, isUserSystemAdmin, isConnected } from '../utils/utils';

export const requireSystemAdmin = (req: Request, res: Response, next: () => void) => {
   const call: AppCallRequest = req.body as AppCallRequest;
   const i18nObj = configureI18n(call.context);
   const actingUser: AppActingUser = call.context.acting_user as AppActingUser;

   if (!actingUser) {
      res.json(showMessageToMattermost(new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.not-provided'), call)));
      return;
   }

   if (!isUserSystemAdmin(actingUser)) {
      res.json(showMessageToMattermost(new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.system-admin'), call)));
      return;
   }

   next();
};

export const requireUserOAuthConnected = (req: Request, res: Response, next: () => void) => {
   const call: AppCallRequest = req.body as AppCallRequest;
   const i18nObj = configureI18n(call.context);
   const oauth2: Oauth2App = call.context.oauth2 as Oauth2App;

   if (!isConnected(oauth2)) {
      res.json(showMessageToMattermost(new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.oauth-user'), call)));
      return;
   }

   next();
};