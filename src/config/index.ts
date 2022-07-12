require('dotenv').config('../');

export default {
    APP: {
        PORT: Number(process.env.PORT),
        HOST: process.env.HOST
    },
    PAGERDUTY: {
        URL: 'https://api.pagerduty.com',
        TOKEN: 'u+g8knycscxs-4dyk-Hw',
        IDENTITY: 'https://identity.pagerduty.com'
    }
}
