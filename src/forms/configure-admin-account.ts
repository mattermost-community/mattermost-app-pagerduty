import {
    AppCallRequest,
    AppCallValues,
    AppForm,
    Oauth2App,
} from '../types';
import { AppExpandLevels, AppFieldSubTypes, AppFieldTypes, ConfigureForm, ExceptionType, PagerDutyIcon, Routes, StoreKeys } from '../constant';
import { KVStoreClient, KVStoreOptions, KVStoreProps } from '../clients/kvstore';
import { configureI18n } from '../utils/translations';
import { MattermostClient } from '../clients/mattermost';
import { Exception } from '../utils/exception';

export async function pagerDutyConfigForm(call: AppCallRequest): Promise<AppForm> {
    const i18nObj = configureI18n(call.context);
    const oauth2: Oauth2App | undefined = call.context.oauth2;

    const form: AppForm = {
        title: i18nObj.__('forms.configure-admin.title'),
        header: i18nObj.__('forms.configure-admin.header'),
        icon: PagerDutyIcon,
        fields: [
            {
                type: AppFieldTypes.TEXT,
                name: ConfigureForm.CLIENT_ID,
                modal_label: i18nObj.__('forms.configure-admin.label-client'),
                value: oauth2?.client_id,
                description: i18nObj.__('forms.configure-admin.description-client'),
                is_required: true,
            },
            {
                type: AppFieldTypes.TEXT,
                subtype: AppFieldSubTypes.PASSWORD,
                name: ConfigureForm.CLIENT_SECRET,
                modal_label: i18nObj.__('forms.configure-admin.label-secret'),
                value: oauth2?.client_secret,
                description: i18nObj.__('forms.configure-admin.description-secret'),
                is_required: true,
            },
        ],
        submit: {
            path: Routes.App.CallPathConfigSubmit,
            expand: {
                locale: AppExpandLevels.EXPAND_SUMMARY,
                acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_app: AppExpandLevels.EXPAND_ALL,
                channel: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
    return form;
}

export async function pagerDutyConfigSubmit(call: AppCallRequest): Promise<string> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const accessToken: string | undefined = call.context.acting_user_access_token;
    const botUserID: string | undefined = call.context.bot_user_id;
    const values: AppCallValues = <any>call.values;
    const i18nObj = configureI18n(call.context);
    const teamId = call.context.channel.team_id as string;

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
    };

    await kvStoreClient.storeOauth2App(oauth2App);
    const mattermostClient: MattermostClient = new MattermostClient(options);
    await mattermostClient.addUserToTeam(<string>teamId, <string>botUserID);

    return i18nObj.__('api.configure.configure_admin_account_response');
}

