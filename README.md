# Spotnextdoor

### Requirements
- Linux environment
- Docker (recommended at least 24.0.7)
- Docker compose (recommended at least v2.21.0)

### Start project
Set the **docker-compose.yml** & **docker-compose-utilities** variables (optional) and then Run in the project root, also make sure that build database (restore.sql) is at /postgres-db/restore
- > docker compose build
- > docker compose up -d
- > docker compose -f docker-compose-utilities.yml run --rm pg_restore

#### Database (port: 5432)
Backup database
- > docker compose -f docker-compose-utilities.yml run --rm pg_backup

Restore database (restore.sql file inside of /postgres-db/restore)
- > docker compose -f docker-compose-utilities.yml run --rm pg_restore
