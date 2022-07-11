import {
    AppCallRequest,
    AppCallValues,
    AppForm,
} from '../types';
import {AppFieldTypes, ConfigureForm, PagerDutyIcon, Routes, StoreKeys} from '../constant';
import {KVStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';

export async function pagerDutyConfigForm(call: AppCallRequest): Promise<AppForm> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const config: KVStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const form: AppForm = {
        title: 'Configure PagerDuty',
        header: 'Configure the PagerDuty app with the following information.',
        icon: PagerDutyIcon,
        fields: [
            {
                type: AppFieldTypes.TEXT,
                name: ConfigureForm.CLIENT_ID,
                modal_label: 'Client ID',
                value: config.pagerduty_client_id,
                description: 'API integration PagerDuty client id',
                is_required: true,
            },
            {
                type: AppFieldTypes.TEXT,
                name: ConfigureForm.CLIENT_SECRET,
                modal_label: 'Client Secret',
                value: config.pagerduty_client_secret,
                description: 'API integration PagerDuty client secret',
                is_required: true,
            },
            {
                type: AppFieldTypes.TEXT,
                name: ConfigureForm.CLIENT_URL,
                modal_label: 'Client url',
                value: config.pagerduty_client_url,
                description: 'API integration PagerDuty client url',
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
    const pagerDutyClientURL: string = values[ConfigureForm.CLIENT_URL];

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const config: KVStoreProps = {
        pagerduty_client_id: pagerDutyClientID,
        pagerduty_client_secret: pagerDutyClientSecret,
        pagerduty_client_url: pagerDutyClientURL
    };
    await kvStoreClient.kvSet(StoreKeys.config, config);
}

