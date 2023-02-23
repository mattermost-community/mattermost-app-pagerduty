import { Request, Response } from 'express';

import { AppCallResponse, AppsState } from '../types';
import { newOKCallResponseWithData } from '../utils/call-responses';
import { getAppBindings } from '../bindings';

export const getBindings = async (request: Request, response: Response) => {
    const bindings: AppsState[] = await getAppBindings(request.body);
    const callResponse: AppCallResponse = newOKCallResponseWithData(bindings);

    response.json(callResponse);
};

