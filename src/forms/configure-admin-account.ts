import {
    AppCallRequest,
    AppCallValues,
    AppForm,
} from '../types';
import {AppFieldTypes, ConfigureForm, PagerDutyIcon, Routes, StoreKeys} from '../constant';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';

export async function pagerDutyConfigForm(call: AppCallRequest): Promise<AppForm> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const config: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

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
                name: ConfigureForm.URL,
                modal_label: 'Url',
                value: config.pagerduty_url,
                description: 'API integration PagerDuty url',
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
    const pagerDutyURL: string = values[ConfigureForm.URL];

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const config: ConfigStoreProps = {
        pagerduty_client_id: pagerDutyClientID,
        pagerduty_url: pagerDutyURL
    };
    await kvStoreClient.kvSet(StoreKeys.config, config);
}

