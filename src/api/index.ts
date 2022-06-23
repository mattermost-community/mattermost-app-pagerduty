import express, {Router} from 'express';
import {Routes} from '../constant';
import * as cManifest from './manifest';
import * as cBindings from './bindings';
import * as cInstall from './install';
import * as cHelp from './help';
import * as cConfigure from './configure';
import * as cSubscription from './subscription';

const router: Router = express.Router();

router.get(Routes.App.ManifestPath, cManifest.getManifest);
router.post(Routes.App.BindingsPath, cBindings.getBindings);
router.post(Routes.App.InstallPath, cInstall.getInstall);
router.post(`${Routes.App.BindingPathHelp}`, cHelp.getHelp);

router.post(`${Routes.App.CallPathConfigForm}`, cConfigure.configureAdminAccountForm);
router.post(`${Routes.App.CallPathConfigSubmit}`, cConfigure.configureAdminAccountSubmit);

router.post(`${Routes.App.CallPathSubscriptionAddSubmit}`, cSubscription.subscriptionAddSubmit);
router.post(`${Routes.App.CallPathSubscriptionDeleteSubmit}`, cSubscription.subscriptionDeleteSubmit);
router.post(`${Routes.App.CallPathSubscriptionListSubmit}`, cSubscription.subscriptionListSubmit);

router.post(`${Routes.App.CallPathConnectSubmit}`, cConfigure.connectAccountLoginSubmit);
router.post(`${Routes.App.OAuthConnectPath}`, cConfigure.fOauth2Connect);
router.get(`${Routes.App.OAuthCompletePath}`, cConfigure.fOauth2Complete);

const staticRouter = express.Router();
staticRouter.use(express.static('static'));
router.use('/static', staticRouter);

export default router;
