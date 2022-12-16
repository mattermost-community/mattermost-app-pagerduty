require('dotenv').config('../');

export default {
    APP: {
        PORT: Number(process.env.PORT) || 4003,
        HOST: process.env.HOST || '',
    },
    PAGERDUTY: {
        URL: 'https://api.pagerduty.com',
        IDENTITY: 'https://identity.pagerduty.com',
    },
};
