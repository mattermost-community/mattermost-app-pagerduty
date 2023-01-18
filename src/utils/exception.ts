import { AppCallRequest } from '../types';
import { ExceptionType } from '../constant';
import { logger } from './logger';


export class Exception extends Error {
    constructor(
        public readonly type: ExceptionType,
        public readonly message: string,
        public readonly userMessage: string,
        public readonly call: AppCallRequest,

    ) {
        super(userMessage);

        const siteUrl: string = call.context.mattermost_site_url as string;
        const requestPath: string = call.path;

        logger.error({ message, siteUrl, requestPath });
    }
}
