import { Request, Response } from 'express';
import { getAllOnCall } from "../forms/list-on-call";
import { AppCallResponse, OnCallRecord } from "../types";
import { CallResponseHandler, newOKCallResponseWithMarkdown } from "../utils/call-responses";
import { h6, hyperlink, joinLines } from '../utils/markdown';
import { showMessageToMattermost } from "../utils/utils";

export const listOnCallSubmit: CallResponseHandler = async (req: Request, res: Response) => {
   let callResponse: AppCallResponse;

   try {
      const onCallList: OnCallRecord[] = await getAllOnCall(req.body);
      const servicesText: string = [
         getHeader(onCallList.length),
         getOnCall(onCallList)
      ].join('');
      callResponse = newOKCallResponseWithMarkdown(servicesText);
      res.json(callResponse);
   } catch (error: any) {
      callResponse = showMessageToMattermost(error);
      res.json(callResponse);
   }
};

function getHeader(serviceLength: number): string {
   return h6(`Policy List: Found ${serviceLength} matching policies.`);
}

function getOnCall(services: OnCallRecord[]): string {
   return `${joinLines(
      services.map((record: OnCallRecord) => `- ${record.escalation_policy.summary} (${record.escalation_level}) - By ${record.user.summary} ${hyperlink('View detail.', record.escalation_policy.html_url)}`).join('\n')
   )}\n`;
}