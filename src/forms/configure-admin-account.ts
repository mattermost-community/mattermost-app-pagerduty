import {
    AppCallRequest,
    AppCallValues,
    AppForm,
} from '../types';
import {AppFieldTypes, ConfigureForm, PagerDutyIcon, Routes, StoreKeys} from '../constant';
import {KVStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {configureI18n} from "../utils/translations";

export async function pagerDutyConfigForm(call: AppCallRequest): Promise<AppForm> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
		const i18nObj = configureI18n(call.context);

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const config: KVStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const form: AppForm = {
        title: i18nObj.__('forms.configure-admin.title'),
        header: i18nObj.__('forms.configure-admin.header'),
        icon: PagerDutyIcon,
        fields: [
            {
                type: AppFieldTypes.TEXT,
                name: ConfigureForm.CLIENT_ID,
                modal_label: i18nObj.__('forms.configure-admin.label-client'),
                value: config.pagerduty_client_id,
                description: i18nObj.__('forms.configure-admin.description-client'),
                is_required: true,
            },
            {
                type: AppFieldTypes.TEXT,
                name: ConfigureForm.CLIENT_SECRET,
                modal_label: i18nObj.__('forms.configure-admin.label-secret'),
                value: config.pagerduty_client_secret,
                description: i18nObj.__('forms.configure-admin.description-secret'),
                is_required: true,
            }
        ],
        submit: {
            path: Routes.App.CallPathConfigSubmit,
            expand: {}
        },
    };
    return form;
}

export async function pagerDutyConfigSubmit(call: AppCallRequest): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const values: AppCallValues = <any>call.values;

    const pagerDutyClientID: string = values[ConfigureForm.CLIENT_ID];
    const pagerDutyClientSecret: string = values[ConfigureForm.CLIENT_SECRET];

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const config: KVStoreProps = {
        pagerduty_client_id: pagerDutyClientID,
        pagerduty_client_secret: pagerDutyClientSecret,
    };
    await kvStoreClient.kvSet(StoreKeys.config, config);
}

