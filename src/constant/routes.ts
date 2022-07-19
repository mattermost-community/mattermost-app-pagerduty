
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
    CallPathOnCallSubmit: '/oncall/list/submit',

    CallPathSubscriptionAddSubmit: '/subscription/add/submit',
    CallPathSubscriptionDeleteSubmit: '/subscription/delete/submit',
    CallPathSubscriptionListSubmit: '/subscription/list/submit',

    CallPathConnectSubmit: '/connect/login/submit',
    CallPathDisconnectSubmit: '/connect/disconnect/submit',
    OAuthCompletePath: '/oauth2/complete',
    OAuthConnectPath: '/oauth2/connect',

    CallPathIncidentCreate: '/incident/create',
    
    CallPathIncidentAcknowledgedAction: '/incident/acknowledged/action',
    CallPathIncidentUnAcknowledgedAction: '/incident/unacknowledged/action',

    CallPathIncidentResolveSubmit: '/incident/resolve/submit',
    CallPathIncidentResolveAction: '/incident/resolve/action',
    
    CallPathIncidentOtherActions: '/incident/otheractions',

    CallPathNoteToIncidentSubmit: '/incident/note/submit',
    CallPathNoteToIncidentAction: '/incident/note/action',

    CallPathAssignIncidentSubmit: '/incident/assign/submit',
    CallPathAssignIncidentAction: '/incident/assign/action',

    CallPathChangeIncidentPrioritySubmit: '/incident/priority/change/submit',
    CallPathChangeIncidentPriorityAction: '/incident/priority/change/action',

    CallPathDetailViewIncidentAction: '/incident/detail/action',

    CallPathIncidentCloseOptions: '/incident/closeoptions',

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

    NotesPathPrefix: '/notes',

    ServicesPathPrefix: '/services',
    ServicePathPrefix: `/services/${PathsVariable.Identifier}`,

    OnCallPathPrefix: '/oncalls',

    UsersPathPrefix: '/users',
    CurrentUserPathPrefix: '/users/me',
    UserPathPrefix: `/users/${PathsVariable.Identifier}`,

    WebhookSubscriptionsPathPrefix: '/webhook_subscriptions',
    WebhookSubscriptionPathPrefix: `/webhook_subscriptions/${PathsVariable.Identifier}`,
};

const MattermostPaths = {
    PathKV: '/kv',
    PathOAuth2App: '/oauth2/app',
    PathOAuth2User: '/oauth2/user',
    UsersUpdateRolePath: `/users/${PathsVariable.Identifier}/roles`,
    PostsPath: '/posts',
    PostsEphemeralPath: '/posts/ephemeral',
    PostPath: `/posts/${PathsVariable.Identifier}`,
    UserPath: `/users/${PathsVariable.Identifier}`,
    ChannelPath: `/channels/${PathsVariable.Identifier}`,
    ChannelDirectPath: `/channels/direct`,
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
