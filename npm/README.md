# @nitra/reassign-owner

## Reassign all objects in database to new owner

@nitra/reassign-owner uses the same environment variables as libpq and psql to connect to a PostgreSQL server.

To run and specify which database to connect to we can invoke it like so::

```bash
PGUSER=dbuser \
  PGHOST=database.server.com \
  PGPASSWORD=secretpassword \
  PGDATABASE=mydb \
  PGPORT=3211 \
  npx @nitra/pg-reassign-owner NEW_DB_OWNER
```

The default values for the environment variables used are:

```bash
  PGHOST=localhost \
  PGUSER=process.env.USER \
  PGDATABASE=process.env.USER \
  PGPASSWORD=null \
  PGPORT=5432 \
  npx @nitra/pg-reassign-owner NEW_DB_OWNER
```

original question:
https://stackoverflow.com/questions/1348126/postgresql-modify-owner-on-all-tables-simultaneously-in-postgresql/2686185#2686185
