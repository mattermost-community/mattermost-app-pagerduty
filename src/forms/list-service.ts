import {AppCallRequest, Service} from '../types';
import {ExceptionType, PDFailed, Routes} from '../constant';
import {APIResponse, PartialCall} from "@pagerduty/pdjs/build/src/api";
import {api} from "@pagerduty/pdjs";
import { tryPromiseForGenerateMessage } from '../utils/utils';

export async function getAllServicesCall(call: AppCallRequest): Promise<Service[]> {
    const token = 'u+A6-xHEHsaUDY6U4Wmw';
    const tokenType = 'token';

    const pdClient: PartialCall = api({ token, tokenType });
    const responseServices: APIResponse = await tryPromiseForGenerateMessage(pdClient.get(Routes.PagerDuty.ServicesPathPrefix), ExceptionType.MARKDOWN, PDFailed);
    const services: Service[] = responseServices?.data['services'];
    return services;
}
