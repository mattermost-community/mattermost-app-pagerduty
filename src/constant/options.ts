import { AppSelectOption, AttachmentOption } from '../types';

export const option_time_5m = '5m';
export const option_time_10m = '10m';
export const option_time_15m = '15m';
export const option_time_30m = '30m';
export const option_time_1h = '1h';
export const option_time_2h = '2h';
export const option_time_6h = '6h';
export const option_time_1d = '1d';

export const options_times: AttachmentOption[] = [
    {
        text: '5 min.',
        value: option_time_5m,
    },
    {
        text: '10 min.',
        value: option_time_10m,
    },
    {
        text: '15 min.',
        value: option_time_15m,
    },
    {
        text: '30 min.',
        value: option_time_30m,
    },
    {
        text: '1 hour.',
        value: option_time_1h,
    },
    {
        text: '2 hours.',
        value: option_time_2h,
    },
    {
        text: '6 hours.',
        value: option_time_6h,
    },
    {
        text: '1 day.',
        value: option_time_1d,
    },
];

export const options_incident_time: AppSelectOption[] = [
    {
        label: '5 min.',
        value: option_time_5m,
    },
    {
        label: '10 min.',
        value: option_time_10m,
    },
    {
        label: '15 min.',
        value: option_time_15m,
    },
    {
        label: '30 min.',
        value: option_time_30m,
    },
    {
        label: '1 hour.',
        value: option_time_1h,
    },
    {
        label: '2 hours.',
        value: option_time_2h,
    },
    {
        label: '6 hours.',
        value: option_time_6h,
    },
    {
        label: '1 day.',
        value: option_time_1d,
    },
];

export const option_incident_reassign = 'reassign';
export const option_incident_change_priority = 'change_priority';
export const option_incident_add_note = 'add_note';

export const options_incident: AttachmentOption[] = [
    {
        text: 'Add note',
        value: option_incident_add_note,
    },
    {
        text: 'Change Priority',
        value: option_incident_change_priority,
    },
    {
        text: 'Reassign',
        value: option_incident_reassign,
    },
];

export const option_alert_priority_p1 = 'P1';
export const option_alert_priority_p2 = 'P2';
export const option_alert_priority_p3 = 'P3';
export const option_alert_priority_p4 = 'P4';
export const option_alert_priority_p5 = 'P5';

export const options_incident_priority: AppSelectOption[] = [
    {
        label: 'P1-Critical',
        value: option_alert_priority_p1,
    },
    {
        label: 'P2-High',
        value: option_alert_priority_p2,
    },
    {
        label: 'P3-Moderate',
        value: option_alert_priority_p3,
    },
    {
        label: 'P4-Low',
        value: option_alert_priority_p4,
    },
    {
        label: 'P5-Informational',
        value: option_alert_priority_p5,
    },
];
