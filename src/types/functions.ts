import { AppContext } from './apps';
import { WebhookRequest } from './mattermost';
import { WebhookEvent } from './pagerduty';

export type WebhookFunction = ({ data: { event }, rawQuery }: WebhookRequest<WebhookEvent<any>>, context: AppContext) => Promise<void>;