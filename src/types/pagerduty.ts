import {Channel} from './mattermost';

export type IncidentWebhook = {
    assignees: {
        html_url: string;
        id: string;
        self: string;
        summary: string;
        type: string;
    }[];
    conference_bridge: any;
    created_at: Date;
    escalation_policy: {
        html_url: string;
        id: string;
        self: string;
        summary: string;
        type: string;
    };
    html_url: string;
    id: string;
    incident_key: string;
    number: string;
    priority: any;
    resolve_reason: any;
    self: string;
    service: {
        html_url: string;
        self: string;
        summary: string;
        type: string;
    };
    status: string;
    teams: any[];
    title: string;
    type: string;
    urgency: string;
};

export type AddNoteWebhook = {
    content: string;
    id: string;
    incident: {
        html_url: string;
        id: string;
        self: string;
        summary: string;
        type: string;
    };
    trimmed: boolean;
    type: string;
};

export type AcknowledgedWebhook = {
    assignees: {
        html_url: string;
        id: string;
        self: string;
        summary: string;
        type: string;
    }[];
    conference_bridge: any;
    created_at: Date;
    escalation_policy: {
        html_url: string;
        id: string;
        self: string;
        summary: string;
        type: string;
    };
    html_url: string;
    id: string;
    incident_key: string;
    number: number;
    priority: string;
    resolve_reason: any;
    self: string;
    service: {
        html_url: string;
        id: string;
        self: string;
        summary: string;
        type: string;
    };
    status: string;
    teams: any[];
    title: string;
    type: string;
    urgency: string;
}

export type ReassignedWebhook = {
    assignees: {
        html_url: string;
        id: string;
        self: string;
        summary: string;
        type: string;
    }[];
    conference_bridge: any;
    created_at: Date;
    escalation_policy: {
        html_url: string;
        id: string;
        self: string;
        summary: string;
        type: string;
    };
    html_url: string;
    id: string;
    incident_key: string;
    number: number;
    priority: string;
    resolve_reason: any;
    self: string;
    service: {
        html_url: string;
        id: string;
        self: string;
        summary: string;
        type: string;
    };
    status: string;
    teams: any[];
    title: string;
    type: string;
    urgency: string;
}

export type Incident = {
    incident_number: number;
    title: string;
    description: string;
    created_at: Date;
    status: string;
    incident_key: string;
    service: {
        id: string;
        type: string;
        summary: string;
        self: string;
        html_url: string;
    };
    assignments: any[];
    assigned_via: string;
    last_status_change_at: Date;
    first_trigger_log_entry: {
        id: string;
        type: string;
        summary: string;
        self: string;
        html_url: string;
    };
    alert_counts: {
        all: number;
        triggered: number;
        resolve: number;
    };
    is_mergeable: boolean;
    escalation_policy: {
        id: string;
        type: string;
        summary: string;
        self: string;
        html_url: string;
    };
    teams: any[];
    pending_actions: any[];
    acnowledgements: any[];
    basic_alert_grouping: any;
    alert_grouping: any;
    last_status_change_by: {
        id: string;
        type: string;
        summary: string;
        self: string;
        html_url: string;
    };
    incidents_responders: any[];
    responder_requests: any[];
    subscriber_requests: any[];
    urgency: string;
    id: string;
    type: string;
    summary: string;
    self: string;
    html_url: string;
};

export type Service = {
    id: string;
    name: string;
    description: string;
    created_at: Date;
    updated_at: Date;
    status: string;
    teams: {
        id: string;
        type: string;
        summary: string;
        self: string;
        html_url: string;
    }[];
    alert_creation: string;
    addons: any[];
    scheduled_actions: any[];
    support_hours: any;
    last_incident_timestamp: any;
    escalation_policy: {
        id: string;
        type: string;
        summary: string;
        self: string;
        html_url: string;
    };
    incident_urgency_rule: {
        type: string;
        urgency: string;
    };
    acknowledgement_timeout: any;
    auto_resolve_timeout: any;
    alert_grouping: any;
    alert_grouping_timeout: any;
    alert_grouping_parameters: {
        type: string;
        config: string;
    };
    integrations: any[];
    response_play: any;
    type: string;
    summary: string;
    self: string;
    html_url: string;
};

export type WebhookSubscription = {
    active: boolean;
    delivery_method: {
        custom_headers: any[];
        extension_id: string;
        id: string;
        secret: string;
        temporarily_disabled: boolean;
        type: string;
        url: string;
    };
    description: string;
    events: string[];
    filter: {
        id: string;
        type: string;
    };
    id: string;
    type: string;
    service?: Service;
    channel?: Channel;
};

export type WebhookEvent<T> = {
    event: {
        agent: {
            html_url: string;
            id: string;
            self: string;
            summary: string;
            type: string;
        };
        client: string;
        data: T,
        event_type: string;
        id: string;
        occurred_at: Date;
        resource_type: string;
    }
};
