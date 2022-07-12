import {api} from '@pagerduty/pdjs';
import {APIResponse, PartialCall} from '@pagerduty/pdjs/build/src/api';
import queryString from 'query-string';
import {AppCallRequest, Incident} from '../types';
import {ExceptionType, PDFailed, Routes} from '../constant';
import { tryPromiseForGenerateMessage } from '../utils/utils';

export async function getAllIncidentsCall(call: AppCallRequest): Promise<Incident[]> {
    const token = 'u+A6-xHEHsaUDY6U4Wmw';
    const tokenType = 'token';

    const pdClient: PartialCall = api({ token, tokenType });

    const queryParams: string = queryString.stringify({
        limit: 500
    });
    const responseServices: APIResponse = await tryPromiseForGenerateMessage(pdClient.get(`${Routes.PagerDuty.IncidentsPathPrefix}?${queryParams}`), ExceptionType.MARKDOWN, PDFailed);
    const incidents: Incident[] = responseServices.data['incidents'];

    return incidents;
}
