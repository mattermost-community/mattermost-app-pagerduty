import express, { Router } from 'express';

import { Routes } from '../constant';

import { requireSystemAdmin, requireUserOAuthConnected } from '../restapi/middleware';

import * as cManifest from './manifest';
import * as cBindings from './bindings';
import * as cInstall from './install';
import * as cHelp from './help';
import * as cConfigure from './configure';
import * as cSubscription from './subscription';
import * as cWebhook from './webhook';
import * as cService from './service';
import * as cIncident from './incident';
import * as cOnCall from './on-call';

const router: Router = express.Router();

router.get(Routes.App.ManifestPath, cManifest.getManifest);
router.post(Routes.App.BindingsPath, cBindings.getBindings);
router.post(Routes.App.InstallPath, cInstall.getInstall);
router.post(`${Routes.App.BindingPathHelp}`, cHelp.getHelp);

router.post(`${Routes.App.CallPathConfigForm}`, requireSystemAdmin, cConfigure.configureAdminAccountForm);
router.post(`${Routes.App.CallPathConfigSubmit}`, requireSystemAdmin, cConfigure.configureAdminAccountSubmit);

router.post(`${Routes.App.CallPathSubscriptionAddSubmit}`, requireUserOAuthConnected, cSubscription.subscriptionAddSubmit);
router.post(`${Routes.App.CallPathSubscriptionDeleteSubmit}`, requireUserOAuthConnected, cSubscription.subscriptionDeleteSubmit);
router.post(`${Routes.App.CallPathSubscriptionListSubmit}`, requireUserOAuthConnected, cSubscription.subscriptionListSubmit);

router.post(`${Routes.App.CallPathServiceSubmit}`, requireUserOAuthConnected, cService.listTeamsSubmit);
router.post(`${Routes.App.CallPathIncidentSubmit}`, requireUserOAuthConnected, cIncident.listIncidentSubmit);
router.post(`${Routes.App.CallPathOnCallSubmit}`, requireUserOAuthConnected, cOnCall.listOnCallSubmit);

router.post(`${Routes.App.CallPathConnectSubmit}`, cConfigure.connectAccountLoginSubmit);
router.post(`${Routes.App.CallPathDisconnectSubmit}`, requireUserOAuthConnected, cConfigure.fOauth2Disconnect);
router.post(`${Routes.App.OAuthConnectPath}`, cConfigure.fOauth2Connect);
router.post(`${Routes.App.OAuthCompletePath}`, cConfigure.fOauth2Complete);

router.post(`${Routes.App.CallPathIncomingWebhookPath}`, cWebhook.incomingWebhook);
router.post(`${Routes.App.CallPathForms}${Routes.App.CallPathIncidentCreate}`, requireUserOAuthConnected, cIncident.createNewIncident);
router.post(`${Routes.App.CallPathForms}${Routes.App.CallPathIncidentCreate}${Routes.App.CallPathSubmit}`, requireUserOAuthConnected, cIncident.submitCreateNewIncident);

// FROM WEBHOOK ACTIONS
router.post(`${Routes.App.CallPathIncidentAcknowledgedAction}`, requireUserOAuthConnected, cIncident.ackIncidentAction);

router.post(`${Routes.App.CallPathIncidentResolveAction}`, requireUserOAuthConnected, cIncident.resolveIncidentModal);
router.post(`${Routes.App.CallPathIncidentResolveSubmit}`, requireUserOAuthConnected, cIncident.resolveIncidentSubmit);

router.post(`${Routes.App.CallPathDetailViewIncidentAction}`, requireUserOAuthConnected, cIncident.showIncidentDetail);

router.post(`${Routes.App.CallPathNoteToIncidentAction}`, requireUserOAuthConnected, cIncident.addNoteToIncidentModal);
router.post(`${Routes.App.CallPathNoteToIncidentSubmit}`, requireUserOAuthConnected, cIncident.addNoteToIncidentSubmit);

router.post(`${Routes.App.CallPathAssignIncidentAction}`, requireUserOAuthConnected, cIncident.reassignIncidentModal);
router.post(`${Routes.App.CallPathAssignIncidentSubmit}`, requireUserOAuthConnected, cIncident.reassignIncidentSubmit);

router.post(`${Routes.App.CallPathChangeIncidentPriorityAction}`, requireUserOAuthConnected, cIncident.changePriorityIncidentModal);
router.post(`${Routes.App.CallPathChangeIncidentPrioritySubmit}`, requireUserOAuthConnected, cIncident.changePriorityIncidentSubmit);

const staticRouter = express.Router();
staticRouter.use(express.static('static'));
router.use('/static', staticRouter);

export default router;
