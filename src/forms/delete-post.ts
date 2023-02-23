import {
    AppCallAction, AppContext,
    AppContextAction,
} from '../types';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import { tryPromisePagerdutyWithMessage } from '../utils/utils';
import { configureI18n } from '../utils/translations';

export async function deletePostCall(call: AppCallAction<AppContextAction>, context: AppContext): Promise<void> {
    const mattermostUrl: string = call.context.mattermost_site_url;
    const accessToken: string = call.context.bot_access_token;
    const postId: string = call.post_id;
    const mattermostOptions: MattermostOptions = {
        mattermostUrl,
        accessToken: <string>accessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    const i18nObj = configureI18n(context);

    await tryPromisePagerdutyWithMessage(mattermostClient.deletePost(postId), i18nObj.__('forms.delete-post.failed'));
}
