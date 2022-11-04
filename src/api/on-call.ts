import { Request, Response } from 'express';
import { getAllOnCall } from "../forms/list-on-call";
import {AppCallRequest, AppCallResponse, AppContext, OnCallRecord} from "../types";
import { CallResponseHandler, newOKCallResponseWithMarkdown } from "../utils/call-responses";
import { h6, hyperlink, joinLines } from '../utils/markdown';
import {configureI18n} from "../utils/translations";
import { showMessageToMattermost } from "../utils/utils";

export const listOnCallSubmit: CallResponseHandler = async (req: Request, res: Response) => {
   let callResponse: AppCallResponse;
	 const call: AppCallRequest = req.body;

   try {
      const onCallList: OnCallRecord[] = await getAllOnCall(req.body);
      const servicesText: string = [
         getHeader(onCallList.length, call.context),
         getOnCall(onCallList, call.context)
      ].join('');
      callResponse = newOKCallResponseWithMarkdown(servicesText);
      res.json(callResponse);
   } catch (error: any) {
      callResponse = showMessageToMattermost(error);
      res.json(callResponse);
   }
};

function getHeader(serviceLength: number, context: AppContext): string {
	 const i18nObj = configureI18n(context);

   return h6(i18nObj.__('api.on_call.text', { length: serviceLength.toString() }));
}

function getOnCall(services: OnCallRecord[], context: AppContext): string {
	 const i18nObj = configureI18n(context);

   return `${joinLines(
      services.map((record: OnCallRecord) => i18nObj.__('api.on_call.call', 
					{ 
							policy_summary: record.escalation_policy.summary,
							level: record.escalation_level.toString(),
							user_summary: record.user.summary,
							hyperlink: hyperlink(i18nObj.__('api.incident.detail'), record.escalation_policy.html_url)
					})).join('\n')
   )}\n`;
}
