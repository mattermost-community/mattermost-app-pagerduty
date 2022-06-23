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
    }[];
    id: string;
    type: string;
};
