const PathsVariable = {
    Identifier: ':IDENTIFIER'
}

export const AppsPluginName = 'com.mattermost.apps';

const AppPaths = {
    ManifestPath: '/manifest.json',
    BindingsPath: '/bindings',
    InstallPath: '/install',
    BindingPathHelp: '/help',

    CallPathConfigForm: '/config/form',
    CallPathConfigSubmit: '/config/form/submit',

    CallPathServiceSubmit: '/service/list/submit',
    CallPathIncidentSubmit: '/incident/list/submit',

    CallPathSubscriptionAddSubmit: '/subscription/add/submit',
    CallPathSubscriptionDeleteSubmit: '/subscription/delete/submit',
    CallPathSubscriptionListSubmit: '/subscription/list/submit',

    CallPathConnectSubmit: '/connect/login/submit',
    OAuthCompletePath: '/oauth2/complete',
    OAuthConnectPath: '/oauth2/connect',

    CallPathIncidentCreate: '/incident/create',
    CallPathIncidentAcknowledgedAction: '/alert/acknowledged/action',
    CallPathIncidentResolveAction: '/alert/resolve/action',
    CallPathIncidentOtherActions: '/alert/otheractions',
    CallPathIncomingWebhookPath: '/webhook',
    CallPathSubmit: '/submit',
    CallPathForm: '/form',
    CallPathForms: '/forms',
}

const PagerDutyPaths = {
    OAuthAuthorizationPathPrefix: '/oauth/authorize',
    OAuthTokenPathPrefix: '/oauth/token',

    IncidentsPathPrefix: '/incidents',
    IncidentPathPrefix: `/incidents/${PathsVariable.Identifier}`,

    ServicesPathPrefix: '/services',
    ServicePathPrefix: `/services/${PathsVariable.Identifier}`,

    UsersPathPrefix: '/users',
    UserPathPrefix: `/users/${PathsVariable.Identifier}`,

    WebhookSubscriptionsPathPrefix: '/webhook_subscriptions',
    WebhookSubscriptionPathPrefix: `/webhook_subscriptions/${PathsVariable.Identifier}`,
};

const MattermostPaths = {
    PathKV: '/kv',
    PostsPath: '/posts',
    PostsEphemeralPath: '/posts/ephemeral',
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
