# Fan Graphs

Fan Graphs is an internal catalogue management application with a separate public, customer-facing catalogue site.

## Services

- `postgres`: PostgreSQL database on host port `5432`
- `app`: internal FastAPI application on host port `8000`
- `customer_facing`: public catalogue site on host port `8004`

The public site reads catalogue data from the internal API over the compose network. It does not own a copy of the catalogue database.

## Production deployment

Production configuration is in `.env.deploy`. It must contain real values for the database credentials, session secret, bootstrap administrator credentials, and `CMS_API_TOKEN`.

The production profile is:

```text
COMPOSE_PROFILES=catalogue
```

Deploy from the repository root:

```bash
./redeploy.sh
```

The deployment script builds both application images, prepares the database schema, refreshes the template volume, starts PostgreSQL, waits for the internal API, starts the public catalogue, and checks both health endpoints.

The persistent user systemd unit is:

```text
/home/user1/.config/systemd/user/fan-graphs-deploy.service
```

It must start and stop the `catalogue` profile. Check it with:

```bash
systemctl --user status fan-graphs-deploy.service
podman ps -a
podman logs fan-graphs-app
podman logs vent-tech-catalogue
```

## SIT

Use `.env.sit` and `run_sit.sh` for the local/sit environment:

```bash
./run_sit.sh
```

The SIT stack uses the local application configuration and should not be used as the production deployment mechanism.

## Data and backups

Application media is stored below `data/`. Templates are stored below `templates/` and copied into the production template volume during deployment.

Create a PostgreSQL and media backup with:

```bash
./backup_db_data.sh --deploy
./backup_media_data.sh --deploy
```

Restore with:

```bash
./restore_db_data.sh data/backups/<archive>.zip --deploy
./restore_media_data.sh data/backups/<archive>.zip --deploy
```

Always verify the archive contents and the target environment before restoring. A database restore replaces the public schema.

## Database migrations

Alembic migrations are stored in `alembic/versions/`. The deployment helper runs the configured migrations as part of deployment.

To run migrations directly:

```bash
./migrate_db.sh --deploy
```

## Customer-facing configuration

The customer-facing service uses these compose settings:

- `BACKEND_API_BASE_URL=http://app:8000`
- `PUBLIC_SITE_URL=https://p1.bitrep.nz`
- `CMS_API_TOKEN` for read-only catalogue API access
- `CATALOGUE_CACHE_PATH` for the local rendered catalogue cache

The public site is built from `customer_facing/Containerfile`. Its application code is under `customer_facing/app/`.

## Troubleshooting startup

Check the complete stack first:

```bash
podman ps -a
podman compose -f deploy-compose.yml --profile catalogue ps
```

Then inspect the service that is failing:

```bash
podman inspect fan-graphs-postgres
podman inspect fan-graphs-app
podman inspect vent-tech-catalogue
podman logs --tail 200 vent-tech-catalogue
```

If the public site is missing entirely, check that the systemd unit uses `--profile catalogue` and that port `8004` is not already occupied.
