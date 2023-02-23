# Mattermost/PagerDuty Integration

* [Feature summary](#feature-summary)
* [Set up](#setting-up)
    * [Installation HTTP](#installation-http)
    * [Installation Mattermost Cloud](#installation-mattermost-cloud)
    * [Configuration](#configuration)
* [Admin guide](#admin-guide)
    * [Slash commands](#slash-commands)
* [End user guide](#end-user-guide)
    * [Get started](#get-started)
    * [Use /pd commands](#use-pd-commands)
* [Development environment](#development-environment)
    * [Manual installation](#manual-installation)
    * [Install dependencies](#install-dependencies)
    * [Run the local development environment](#run-the-local-development-environment)
    * [Run the local development environment with docker](#run-the-local-development-environment-with-docker)

This application allows you to integrate PagerDuty to your Mattermost instance, letting you subscribe your PagerDuty's services on any custom channel to get notified about any update related to your services. Also, allows the user to create or display incidents, watch who is on-call, etc. without moving from the Mattermost window.

# Feature summary

**PagerDuty to Mattermost notifications:** Link your Mattermost channels with the PagerDuty Service you want to track, so you and your team can get notifications about the creation and updates of each incident, with a user-friendly interface that will let you reassign, change priority, add notes, view details and more.

# Set up


## Installation HTTP

To install, as a Mattermost system admin user, run the command ``/apps install http PAGERDUTY_API`` in any channel. The ``/pd`` command should be available after the configuration has been successfully installed.

The ``PAGERDUTY_API`` should be replaced with the URL where the Trello API instance is running. Example: ``/apps install http https://myapp.com/manifest.json``

## Installation Mattermost Cloud

To install, as a Mattermost system admin user, run the command ``/apps install listed pagerduty`` in any channel. The ``/pd`` command should be available after the configuration has been successfully installed.


## Configuration

After [installing](#installation)) the app:
1. Open your PagerDuty profile to get your credentials and link to your Mattermost instance. 
2. Select the **Integration** tab in the toolbar. To the right of the popup (in the **Developer Tools** column) select **Developer Mode**
3. On the **My Apps** page, select **Create New APP** and fill the form. 
4. When the form is completed, select **OAuth 2.0** in the same form (on the **Add** button below). 
5. In the **Redirect URL** field, add the following link (where "mattermostURL" should be replaced with the link to you Mattermost instance):
``{mattermostURL}/plugins/com.mattermost.apps/apps/pagerduty/oauth2/remote/complete``
6. Select **Save**.
7. The ``Client ID`` and ``Client Secret`` will be displayed. Save them in a safe place - the ``Client Secret`` can't be recovered). 
8. To finish, in the **Scopes** select **Read/Write**, then select **Save**.
9. Return to Mattermost. 
10. As a super admin role user, run the ``/pd configure`` command.
11. Enter the PagerDuty ``Client ID`` and ``Client Secret`` when prompted.

# Admin guide

## Slash commands

``/pd configure``: This command will enable all the other commands; it asks the administrator for a ``Client ID`` and ``Client Secret`` (which will be used to enable OAuth 2.0 authentication)

# End user guide

## Get started

## Use ``/pd`` commands
- ``/pd help``: This command will show all current commands available for this application.
- ``/pd connect``: Allow to any user to link their PagerDuty account with Mattermost. It must be executed to show the rest of the commands.
- ``/pd incident create``: Allow any user to create a new incident.
- ``/pd incident list``: Allow any user to display all the current incidents.
- ``/pd subscription add``: Allow any user to subscribe any channel to any PagerDuty service that the user has access.
- ``/pd subscription list``: Allow any user to show the current subscriptions for all the channels.
- ``/pd subscription delete``: Will allow you to remove a subscription. No more notifications from that team will be received.
- ``/pd service list``: Get a list of the existing services available to the user.
- ``/pd oncall list``: Get a list of the users that are on-call at the moment.

# Development environment

## Manual installation

*  Download the latest repository release.

### Run the local development environment

* You need to have installed at least node version 15 and maximum version 18. You can download the latest lts version of node for the required operating system here: https://nodejs.org/es/download/

### Install dependencies
* Move to the project directory or execute ``cd`` command to the project directory and execute ``npm install`` with a terminal to download all dependency libraries.

```
$ npm install
```

*  Update the environment configuration file. The ``.env`` file must be modified or added to set the environment variables, it must be in the root of the repository.

```
file: .env

PROJECT=mattermost-app-pagerduty
PORT=4002
HOST=http://localhost:4002
```

Variable definition

- PROJECT: In case of executing the project with Docker using the ``.build.sh`` file, this variable will be used for the name of the container
- PORT: Port number on which the PagerDuty integration is listening
- HOST: PagerDuty API usage URL

* Finally, the project must be executed.

```
$ npm run dev
```

Or, if you would like to use the Makefile command:

```
$ make watch
```

### Run the local development environment with Docker

* You need to have Docker installed. You can find the necessary steps to install Docker for the following operating systems:

[Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
[Mac](https://docs.docker.com/desktop/mac/install/)
[Windows](https://docs.docker.com/desktop/windows/install/)

* Once you have Docker installed, the next step would be to run the ``make run-server`` command to create the API container and expose it locally or on the server, depending on the case required.

```
$ make run-server
```

When the container is created correctly, the API will be running at the url http://127.0.0.1:4002. If Mattermost is running on the same machine, run this slash command in Mattermost to install the app:

```
/apps install http http://127.0.0.1:4002/manifest.json
```

To stop the container, execute:

```
$ make stop-server
```
