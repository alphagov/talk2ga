# Infrastructure

This document details the current clickops infrastructure, to help with the future transition to IaC.
The infra was initially clickops because being an MVP, the focus was on delivering something at speed.

## CloudSQL Database

One PSQL instance, public IP, accessible via the clousql auth proxy. There is a docker container for that, in the docker-compose.yml.
Password is a secret stored inside gcp secrets manager.

To connect to a cloudSQL instance from a local machine, the CloudSQL Auth Proxy must be used.
Authorisation: connection attempts will be authorised if the proxy is used.
Authentication: to connect to a specific DB with PSQL, either use the username/password combination (not recommented), or the IaM authentiacation (recommended).
For IAM authentication, the user must have been created first, with the email address as principal. Create one here: https://console.cloud.google.com/sql/instances/chat-analytics-dev/users?project=data-insights-experimentation
Make sure to create a "Cloud IAM" user, not build-in authentication.
See: https://cloud.google.com/sql/docs/postgres/add-manage-iam-users#creating-a-database-user

e.g
docker-compose up -d cloud-sql-proxy
psql -h 127.0.0.1 -p 5434 -U "your.name@digital.cabinet-office.gov.uk" -d postgres

You must ensure you have first logged into GCloud CLI, as the cloud-sql-proxy container will inherit your Application Default Credentials by volume sharing.
The container has been set up to accept IAM authentiaction, thanks to the command parameter "--auto-iam-authn".
