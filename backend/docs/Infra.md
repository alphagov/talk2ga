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

### CloudSQL permissions

By default, although I added the user account with my email, i couldn't create tables.
So I had to amend the instance policy with superuse role tied to my principal.

However, it turns out that the IAM users don't have the default cloudsql cloudsqlsuperuser role for some reason.
Can't find anything about it in the docs.
The docs do mention that

- the default `postgres` user has it
- users created with the gcloud command that are non-iam but regular psql users also have it

However for iam users, the docs mention that the role must be given manually to the user in IAM. Problem is the `cloudsqlsuperuser` role doesn't exist in the console.
So, I've tried adding all the cloudsql roles to myself and yet, i can't get to create a table with my iam user.

Long story short, i'm gonna drop the IAM authentication and use old school postgres users instead, albeith with gcloud commnand.
I'll add the credentials to a hidden and not commited file on my local machine for now. Then, we'll need to move to terraform asap for secrets management.

I've just create a user with gcloud according to this link: https://cloud.google.com/sql/docs/postgres/create-manage-users#creating
And i can log in with it and create tables.

---

ANYWAY, back to the infra docs:

### CloudSQL infra stuff

We'll have one CloudSQL instance per environment, and in each we'll create a database on top of the existing `postgres` system one.
For now we'll have only the dev one
We'll create a service accoutn for the cloudrun instnace, and that account will have cloudsql roles, and the python code will hace the db connection string according to the env.
Then to connect to the db from local, I'll use the iam user for everyday stuff, and the actualy postgres user for migrations.

Next steps: create the db and user for env dev. Deploy the cloudrun instnace with hardcoded env and db url and test it works.
Then, add the db data as secrets in gcp, and reference it in the python.

Created:

- db "chat-dev" in instance "chat-analytics-dev"
- created psql user "dev" with password, with gcloud cli so that it has superuser
- service account "chatbot-cloudrun-dev" and gave it a few roles: sql client
- authorised cloudrun to connect to the instance by adding a connection in the cloudrun options, which then appears in the yaml
- modified the connection string in that format: postgresql+asyncpg://user:pass@/db-name?host=/cloudsql/data-insights-experimentation:europe-west2:chat-analytics-dev
