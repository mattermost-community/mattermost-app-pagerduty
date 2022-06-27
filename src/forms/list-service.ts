import {AppCallRequest, Service} from '../types';
import {Routes} from '../constant';
import {APIResponse, PartialCall} from "@pagerduty/pdjs/build/src/api";
import {api} from "@pagerduty/pdjs";

export async function getAllServicesCall(call: AppCallRequest): Promise<Service[]> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;

    const pdClient: PartialCall = api({ token: 'u+Xfr4svUs-Q5fVDSx_w', tokenType: 'token' });
    const responseServices: APIResponse = await pdClient.get(Routes.PagerDuty.ServicesPathPrefix);
    const services: Service[] = responseServices.data['services'];

    return services;
}
