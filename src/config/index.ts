require('dotenv').config('../');

export default {
    APP: {
        PORT: Number(process.env.PORT) || 4503,
        HOST: process.env.HOST || ''
    },
    PAGERDUTY: {
        URL: 'https://api.pagerduty.com',
        IDENTITY: 'https://identity.pagerduty.com'
    }
}
