import {api} from '@pagerduty/pdjs';
import {APIResponse, PartialCall} from '@pagerduty/pdjs/build/src/api';
import queryString from 'query-string';
import {AppCallRequest, Incident} from '../types';
import {Routes} from '../constant';

export async function getAllIncidentsCall(call: AppCallRequest): Promise<Incident[]> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;

    const pdClient: PartialCall = api({ token: 'u+Xfr4svUs-Q5fVDSx_w', tokenType: 'token' });

    const queryParams: string = queryString.stringify({
        limit: 500
    });
    const responseServices: APIResponse = await pdClient.get(`${Routes.PagerDuty.IncidentsPathPrefix}?${queryParams}`);
    const incidents: Incident[] = responseServices.data['incidents'];

    return incidents;
}
