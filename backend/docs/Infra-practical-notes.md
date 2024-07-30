# Additional Infrastructure Details

This document highlights information not covered in the main infrastructure documentation provided earlier. It includes details on CloudSQL setup, authentication, permissions and deployment specifics.

## CloudSQL Database

### Instance Details

- **Instance Name**: `chat-analytics`
- **Accessibility**: The instance has a public IP and is accessible via the CloudSQL Auth Proxy. There is a Docker container configuration for this in the `docker-compose.yml`.
- **Authentication**:
  - **IAM Authentication**: Preferred method, requires user creation with email address as the principal.
  - **Username/Password Authentication**: Alternative method using credentials stored in GCP Secrets Manager.

### Connection Setup

- **Local Connection**: Use the CloudSQL Auth Proxy to connect from a local machine. Ensure you are logged into the GCloud CLI as the proxy relies on your Application Default Credentials.
  ```sh
  docker-compose up -d cloud-sql-proxy
  psql -h 127.0.0.1 -p 5434 -U "your.email@example.com" -d postgres
  ```

### CloudSQL Permissions

- **IAM Users**: Initially, IAM users did not have sufficient permissions to create tables. Superuser roles had to be manually assigned, but this approach was problematic.
- **Postgres Users**: Eventually, switched to using traditional PostgreSQL users created with the gcloud command, ensuring they have the necessary permissions for database operations.
- Created user with:

```sh
gcloud sql users create dev --instance=chat-analytics --password=yourpassword
```

## Service Accounts and Roles

- **Service Account**: chatbot-cloudrun-dev
- **Roles**: SQL Client and other necessary roles to connect to CloudSQL from Cloud Run.
- **Cloud Run Authorisation**: The service account is authorised to connect to the CloudSQL instance by adding the connection in the Cloud Run options.

## Environment Configuration

- **Database Instances per Environment**: Plan to have separate CloudSQL instances for each environment (e.g. development, production).
- **Service Account Role Assignment**: Ensure the Cloud Run instance's service account has the required roles for database access.
- **Connection String Format**:

```sh
postgresql+asyncpg://user:pass@/db-name?host=/cloudsql/project-id:region:instance-id
```

## Steps to deploy this infra from scratch

1. **Database and User Creation**:

   - Create the database chat-dev in the chat-analytics-dev instance.
   - Create a PostgreSQL user dev with superuser privileges.

2. **Service Account Configuration**:

   - Create and configure the service account chatbot-cloudrun-dev.
   - Assign appropriate CloudSQL roles to the service account.

3. **Cloud Run Deployment**:

   - Authorise the Cloud Run instance to connect to the CloudSQL instance.
   - Use the connection string format specified above in the application configuration.
   - Deploy the application with the hardcoded environment variables and database URL.

4. **Secrets Management**:
   - Store database credentials in GCP Secrets Manager.
   - Update the application to reference these secrets instead of hardcoded values.

## Key Points

- **IAM Authentication Issues**: Faced challenges with IAM users not having sufficient permissions. Resolved by using traditional PostgreSQL users.
- **Service Account Roles**: Ensured that the service account for Cloud Run has the necessary permissions to access CloudSQL.
- **Connection Management**: Used CloudSQL Auth Proxy for local connections and configured service accounts for Cloud Run to connect securely.
