import config from '../config';

export * from './routes';
export * from './commands';
export * from './store-key';
export * from './forms';
export * from './apps';
export * from './exception-type';
export * from './actions-events';
export * from './options';

export const PagerDutyIcon = 'pagerduty.png';
export const PagerDutyIconRoute = `${config.APP.HOST}/static/${PagerDutyIcon}`;
export const CommandTrigger = 'pd';

export const PDFailed = 'PagerDuty failed';
