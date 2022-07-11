import { AppSelectOption } from "../types"

export const ConfigureForm = {
    CLIENT_ID: 'pagerduty_client_id',
    CLIENT_SECRET: 'pagerduty_client_secret',
    CLIENT_URL: 'pagerduty_url'
}

export const SubscriptionDeleteForm = {
    SUBSCRIPTION_ID: 'subscription_id'
}

export const SubscriptionCreateForm = {
    SERVICE_ID: 'service_id',
    CHANNEL_ID: 'channel_id'
}

export const CreateIncidentForm = {
    SERVICE: 'incident_impacted_service',
    TITLE: 'incident_title',
    DESCRIPTION: 'incident_description',
    ASSIGN_TO: 'incident_assign_to'
}

export type CreateIncidentFormModalType = {
    incident_impacted_service: AppSelectOption,
    incident_title: string,
    incident_description: string,
    incident_assign_to: AppSelectOption
}

export type CreateIncidentFormCommandType = {
    incident_impacted_service: string,
    incident_title: string,
    incident_description: string,
    incident_assign_to: string
}

export const NoteModalForm = Object.freeze({
    NOTE_MESSAGE: 'incident_message'
});