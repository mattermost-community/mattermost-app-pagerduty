import { PartialCall } from '@pagerduty/pdjs/build/src/api';
import { api } from '@pagerduty/pdjs';

import { AppCallRequest, AppCallValues, PagerDutyOpts } from '../types';
import { ExceptionType, Routes, SubscriptionDeleteForm } from '../constant';
import { configureI18n } from '../utils/translations';
import { replace, returnPagerdutyToken, tryPromiseForGenerateMessage } from '../utils/utils';

export async function subscriptionDeleteCall(call: AppCallRequest): Promise<string> {
    const i18nObj = configureI18n(call.context);
    const pdToken: PagerDutyOpts = returnPagerdutyToken(call);
    const values: AppCallValues | undefined = call.values;

    const subscriptionId: string = values?.[SubscriptionDeleteForm.SUBSCRIPTION_ID];

    const pdClient: PartialCall = api(pdToken);

    await tryPromiseForGenerateMessage(
        pdClient.delete(
            replace(Routes.PagerDuty.WebhookSubscriptionPathPrefix, Routes.PathsVariable.Identifier, subscriptionId)
        ),
        ExceptionType.MARKDOWN,
        i18nObj.__('forms.subcription.webhook-delete-failed'),
        call
    );
    return i18nObj.__('api.subcription.deleted');
}
