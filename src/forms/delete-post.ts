import {
    AppCallAction,
    AppContextAction
} from '../types';
import {MattermostClient, MattermostOptions} from '../clients/mattermost';
import { tryPromisePagerdutyWithMessage } from '../utils/utils';

export async function deletePostCall(call: AppCallAction<AppContextAction>): Promise<void> {
    const mattermostUrl: string = call.context.mattermost_site_url;
    const accessToken: string = call.context.bot_access_token;
    const postId: string = call.post_id;
    const mattermostOptions: MattermostOptions = {
        mattermostUrl: mattermostUrl,
        accessToken: <string>accessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    await tryPromisePagerdutyWithMessage(mattermostClient.deletePost(postId), 'Mattermost failed');
}
