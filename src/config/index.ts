require('dotenv').config('../');

export default {
    APP: {
        PORT: Number(process.env.PORT),
        HOST: process.env.HOST
    },
    PAGERDUTY: {
        URL: 'https://api.pagerduty.com',
        TOKEN: 'u+A6-xHEHsaUDY6U4Wmw'
    }
}
