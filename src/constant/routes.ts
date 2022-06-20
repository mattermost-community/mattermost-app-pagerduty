const PathsVariable = {
    Identifier: ':IDENTIFIER'
}

export const AppsPluginName = 'com.mattermost.apps';

const AppPaths = {
    ManifestPath: '/manifest.json',
    BindingsPath: '/bindings',
    InstallPath: '/install',
    BindingPathHelp: '/help',

    CallPathIncidentCreate: '/incident/create',

    CallPathConnectSubmit: '/connect/login/submit',
    OAuthCompletePath: '/oauth2/complete',
    OAuthConnectPath: '/oauth2/connect',
}

const PagerDutyPaths = {
    APIVersionV2: '/v2',
};

const MattermostPaths = {
    PathKV: '/kv',
    PostsPath: '/posts',
    PostPath: `/posts/${PathsVariable.Identifier}`,
    UserPath: `/users/${PathsVariable.Identifier}`,
    ChannelPath: `/channels/${PathsVariable.Identifier}`,
    DialogsOpenPath: '/actions/dialogs/open',
    ApiVersionV4: '/api/v4',
    ApiVersionV1: '/api/v1',
}

export const Routes = {
    PathsVariable,
    App: AppPaths,
    Mattermost: MattermostPaths,
    PagerDuty: PagerDutyPaths
};
