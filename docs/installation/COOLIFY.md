# Coolify deployment

This stack builds the checked-out source and keeps the application, PostgreSQL,
and Redis data in named volumes. Only the application is exposed through
Coolify's proxy; PostgreSQL and Redis remain internal to the Compose stack.

## Prerequisites

- Coolify `v4.0.0-beta.411` or newer. Git-based Compose deployments need this
  version for `SERVICE_*` generated secrets.
- A Git source containing this repository and access to its submodules/files.
- An HTTPS domain whose DNS record points to the Coolify server.

## Create the resource

1. In Coolify, create a resource from a Git repository and select the Docker
   Compose build pack.
2. Set the Compose location to `/docker-compose.coolify.yml`.
3. Set the required environment variable `APP_URL` to the exact public origin,
   for example `https://api.example.com`. Do not include a path or trailing
   slash.
4. On the `new-api` service, assign the domain as
   `https://api.example.com:3000`. The `:3000` suffix tells Coolify which
   container port to route to; clients still use normal HTTPS port 443.
5. Deploy the resource.

Coolify generates and reuses these secrets automatically:

- `SERVICE_PASSWORD_64_POSTGRES`
- `SERVICE_PASSWORD_64_REDIS`
- `SERVICE_BASE64_64_SESSION`

Do not regenerate them during an ordinary redeploy. Changing the session
secret invalidates existing login sessions, while changing a database or Redis
password without updating the stored service data prevents reconnection.

## First-run configuration

1. Open `APP_URL` and complete the initial administrator setup.
2. Add only upstream channels that authorize the account, region, and intended
   use case.
3. Create a gateway token for each calling application instead of distributing
   an upstream provider key.
4. For a private deployment, disable public registration after the required
   users have been created.

## Verify

Check the public health endpoint:

```bash
curl --fail --silent --show-error https://api.example.com/api/status
```

After creating a gateway token, verify the OpenAI-compatible API:

```bash
curl --fail --silent --show-error \
  https://api.example.com/v1/models \
  -H "Authorization: Bearer $NEW_API_TOKEN"
```

Then test the Responses API with a model enabled on the configured upstream:

```bash
curl --fail --silent --show-error \
  https://api.example.com/v1/responses \
  -H "Authorization: Bearer $NEW_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"model":"your-enabled-model","input":"Reply with OK"}'
```

## Persistence, backup, and rollback

The Compose file owns four named volumes: `postgres_data`, `redis_data`,
`new_api_data`, and `new_api_logs`. Configure Coolify backups for the volumes
and take a PostgreSQL logical backup before upgrading the application.

Rollback requires both the previous Git commit and a database backup compatible
with that commit. Rolling back only the container image does not reverse schema
migrations.

## Operational notes

- Do not add host `ports` mappings for PostgreSQL or Redis.
- Preserve the `APP_URL`, generated secrets, and named volumes across redeploys.
- The Compose health checks are authoritative for this stack. A healthy
  container confirms process availability; a real `/v1/responses` request is
  still required to verify upstream connectivity and credentials.
- Streaming is allowed up to 300 seconds of upstream inactivity. Also keep any
  external CDN or load-balancer timeout above the longest expected response.
