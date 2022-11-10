import {
    AppCallRequest,
    AppCallValues,
    AppForm,
    Oauth2App,
} from '../types';
import {AppExpandLevels, AppFieldSubTypes, AppFieldTypes, ConfigureForm, PagerDutyIcon, Routes, StoreKeys} from '../constant';
import {KVStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {configureI18n} from "../utils/translations";

export async function pagerDutyConfigForm(call: AppCallRequest): Promise<AppForm> {
    const oauth2: Oauth2App = call.context.oauth2 as Oauth2App;
    const i18nObj = configureI18n(call.context);

    const form: AppForm = {
        title: i18nObj.__('forms.configure-admin.title'),
        header: i18nObj.__('forms.configure-admin.header'),
        icon: PagerDutyIcon,
        fields: [
            {
                type: AppFieldTypes.TEXT,
                name: ConfigureForm.CLIENT_ID,
                modal_label: i18nObj.__('forms.configure-admin.label-client'),
                value: oauth2.client_id,
                description: i18nObj.__('forms.configure-admin.description-client'),
                is_required: true,
            },
            {
                type: AppFieldTypes.TEXT,
                subtype: AppFieldSubTypes.PASSWORD,
                name: ConfigureForm.CLIENT_SECRET,
                modal_label: i18nObj.__('forms.configure-admin.label-secret'),
                value: oauth2.client_secret,
                description: i18nObj.__('forms.configure-admin.description-secret'),
                is_required: true,
            }
        ],
        submit: {
            path: Routes.App.CallPathConfigSubmit,
            expand: {
                locale: AppExpandLevels.EXPAND_SUMMARY,
                acting_user_access_token: AppExpandLevels.EXPAND_ALL,
            }
        },
    };
    return form;
}

export async function pagerDutyConfigSubmit(call: AppCallRequest): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const accessToken: string | undefined = call.context.acting_user_access_token;
    const values: AppCallValues = <any>call.values;

    const pagerDutyClientID: string = values[ConfigureForm.CLIENT_ID];
    const pagerDutyClientSecret: string = values[ConfigureForm.CLIENT_SECRET];

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>accessToken,
    };
    
    const kvStoreClient = new KVStoreClient(options);

    const oauth2App: Oauth2App = {
        client_id: pagerDutyClientID,
        client_secret: pagerDutyClientSecret,
    }

    await kvStoreClient.storeOauth2App(oauth2App);
}

