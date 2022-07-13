import {PartialCall} from '@pagerduty/pdjs/build/src/api';
import {api} from '@pagerduty/pdjs';
import {AppCallRequest, AppCallValues,} from '../types';
import {KVStoreClient, KVStoreOptions, KVStoreProps} from '../clients/kvstore';
import {ExceptionType, PDFailed, Routes, StoreKeys, SubscriptionDeleteForm} from '../constant';
import {replace, tryPromiseForGenerateMessage, tryPromisePagerDuty} from "../utils/utils";

export async function subscriptionDeleteCall(call: AppCallRequest): Promise<void> {
    const values: AppCallValues | undefined = call.values;

    const subscriptionId: string = values?.[SubscriptionDeleteForm.SUBSCRIPTION_ID];
    const token = 'u+g8knycscxs-4dyk-Hw';
    const tokenType = 'token';

    const pdClient: PartialCall = api({ token, tokenType });
    await tryPromiseForGenerateMessage(pdClient.delete(
        replace(
            Routes.PagerDuty.WebhookSubscriptionPathPrefix,
            Routes.PathsVariable.Identifier,
            subscriptionId
        )
    ), ExceptionType.MARKDOWN, PDFailed);
}
