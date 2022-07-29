# Mattermost/PagerDuty Integration

* [Feature summary](#feature-summary)
* [Setting up](#setting-up)
    * [Installation](#installation)
    * [Configuration](#configuration)
* [Admin guide](#admin-guide)
    * [Slash commands](#slash-commands)
* [End user guide](#end-user-guide)
    * [Getting started](#getting-started)
    * [Using /pd commands](#using-pd-commands)
* [Development](#development)
    * [Manual installation](#manual-installation)
    * [Running the local development environment](#running-the-local-development-environment)
    * [Running the local development environment with docker](#running-the-local-development-environment-with-docker)

This application allows you to integrate PagerDuty to your Mattermost instance, letting you subscribe your PagerDuty's services on any custom channel to get notified about any update related to your services. Also, allows the user to create or display incidents, watch who is on-call, etc. without moving from the Mattermost window.

# Feature summary

**PagerDuty to Mattermost notifications:** Link your Mattermost channels with the PagerDuty Service you want to track, so you and your team can get notifications about the creation and updates of each incident, with a user-friendly interface that will let you reassign, change priority, add notes, view details and more.

# Setting up

## Installation

This plugin requires that your Mattermost workspace has the ``/apps install`` command enabled.

To install, as a super admin user role, execute command ``/apps install http PAGERDUTY_API_URL`` in any channel. ``/pd`` command should be available after the configuration has been successfully installed. PAGERDUTY_API_URL should be replaced with the URL where the PagerDuty API instance is running. Example: ``/apps install http https://mattermost-pagerduty-dev.ancient.mx/manifest.json``

## Configuration

* Step 1: First of all, you will need to install the app in your current Mattermost instance (refer to [Installation](#installation)), the ``/pd`` command should be available.
* Step 2: To be able to obtain the credentials to link your Mattermost instance with your PagerDuty account, you need to access to your PagerDuty page: in the toolbar there is a tab called "Integration", then, on the rigth side of the popup (on "Developer Tools" column) you will click on "Developer Mode" that will redirect to a new page with the title of "My Apps", click on the button "Create New APP" and fill the form. 
* Step 3: After the form is finished, select the option "OAuth 2.0" in the same form (on the "Add" button below). On the field that request "Redirect URL" you will add this link (where "mattermostURL" should be replaced with the link to you Mattermost instance):
``{mattermostURL}/plugins/com.mattermost.apps/apps/PagerDuty/oauth2/remote/complete``
After you press "Save button" a modal will show up with the ``Client ID`` and ``Client Secret``. You must saved them (the Client Secret can not be recovered). To finish, in the "Scopes" select the option "Read/Write" and then press "Save" again.
* Step 4: As a super admin role user, execute "/pd configure" command, and a modal will show up, you will be promted for a PagerDuty ``Client ID`` and ``Client Secret`` (obtained from Step 3)

# Admin guide

## Slash commands

``/pd configure``: This command will enable all the other commands; it asks the administrator for a ``Client ID`` and ``Client Secret`` (which will be used to enable OAuth 2.0 authentication)

# End user guide

## Getting started

## Using /pd commands
- /pd help: This command will show all current commands available for this application.
- /pd connect: Allow to any user to link their PagerDuty account with Mattermost. It must be executed to show the rest of the commands.
- /pd incident create: Allow any user to create a new incident.
- /pd incident list: Allow any user to display all the current incidents.
- /pd subscription add: Allow any user to subscribe any channel to any PagerDuty service that the user has access.
- /pd subscription list: Allow any user to show the current subscriptions for all the channels.
- /pd subscription delete: Will allow you to remove a subscription. No more notifications from that team will be received.
- /pd service list: Get a list of the existing services available to the user.
- /pd oncall list: Get a list of the users that are on-call at the moment.

# Development

## Manual installation

*  Download the latest repository release.

### Running the local development environment

* It is necessary to have installed at least node version 12 and maximum version 18.
  On this page you can download the latest lts version of node for the required operating system: https://nodejs.org/es/download/

*  Install libraries. move to project's directory and execute ``npm install`` to download all dependency libraries

```
$ npm install
```

*  Update the environment configuration file. The .env file must be modified or added to set the environment variables, it must be in the root of the repository.

```
file: .env

PROJECT=mattermost-pagerduty-app
PORT=4002
HOST=https://mattermost-pagerduty-dev.ancient.mx
```

Variable definition

PROJECT: in case of executing the project with docker using the ``.build.sh`` this variable will be used for the name of the container

PORT: port number on which the PagerDuty integration is listening

HOST: PagerDuty API integration usage url

* Finally, the project must be executed.

```
$ npm run dev
```

### Running the local development environment with docker

* It is necessary to have docker installed, on the following page you can find the necessary steps to install docker in the operating system that requires it

[Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
[Mac](https://docs.docker.com/desktop/mac/install/)
[Windows](https://docs.docker.com/desktop/windows/install/)

* Once you have docker installed, the next step would be to run the ``./build.sh file`` to create the API container and expose it locally or on the server, depending on the case required.

```
$ ./build
```

When the container is created correctly, the API will be running at the url http://127.0.0.1:4002
in such a way that the installation can be carried out in Mattermost.
