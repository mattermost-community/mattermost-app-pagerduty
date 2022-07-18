import { api, APIResponse, PartialCall } from "@pagerduty/pdjs/build/src/api";
import { PagerDutyClient, PagerDutyOptions, PagerDutyOpts } from "../clients/pagerduty";
import config from "../config";
import { AppExpandLevels, AppFieldTypes, ExceptionType, NoteModalForm, PagerDutyIcon, PDFailed, Routes } from "../constant";
import { AppCallDialog, AppCallRequest, AppCallValues, AppContextAction, AppField, AppForm, Identifier, IdentifierType, Incident, Oauth2App, PostIncidentNote } from "../types";
import { replace, tryPromiseForGenerateMessage } from "../utils/utils";


export async function addNoteOpenModal(call: AppCallRequest): Promise<AppForm> {

   const fields: AppField[] = [
      {
         modal_label: 'Note',
         type: AppFieldTypes.TEXT,
         name: NoteModalForm.NOTE_MESSAGE,
         description: 'Your note here...',
         max_length: 25000,
         is_required: true,
      },
   ];

   return {
      title: 'Add Note',
      icon: PagerDutyIcon,
      fields: fields,
      submit: {
         path: `${Routes.App.CallPathNoteToIncidentSubmit}`,
         expand: {
            app: AppExpandLevels.EXPAND_SUMMARY,
            oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
            oauth2_user: AppExpandLevels.EXPAND_SUMMARY
         },
         state: call.state
      }
   } as AppForm;
}

export async function addNoteSubmitDialog(call: AppCallRequest): Promise<string> {

   const oauth2: Oauth2App | undefined = call.context.oauth2;
   const incidentValues: AppCallValues | undefined = call.state.incident;
   const incidentId: string = incidentValues?.id;

   const values: AppCallValues | undefined = call.values;
   const incidentMessage: string = values?.[NoteModalForm.NOTE_MESSAGE];
   
   const pdClient: PartialCall = api({ token: oauth2.user?.token, tokenType: 'bearer' });

   const responseIncident: APIResponse = await tryPromiseForGenerateMessage(
      pdClient.get(
         replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)
      ),
      ExceptionType.MARKDOWN,
      'PagerDuty get incident failed'
   );

   const incident: Incident = responseIncident.data['incident'];

   const data: PostIncidentNote = {
      note: {
         content: incidentMessage
      }
   };
   
   await tryPromiseForGenerateMessage(
      pdClient.post(
         `${replace(Routes.PagerDuty.IncidentPathPrefix, Routes.PathsVariable.Identifier, incidentId)}${Routes.PagerDuty.NotesPathPrefix}`, 
         { data }
      ), ExceptionType.MARKDOWN, 'PagerDuty add note failed');

   return `Note will be added for incident ${incident.summary}`
}