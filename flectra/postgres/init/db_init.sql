-- Runs as the postgres superuser on first container start.
-- POSTGRES_DB in docker-compose creates db owned by postgres;
-- this script creates the blueyellow user and grants full management of that database.

CREATE ROLE blueyellow WITH LOGIN PASSWORD 'blueyellow';

ALTER DATABASE db OWNER TO blueyellow;

\c db

ALTER SCHEMA public OWNER TO blueyellow;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO blueyellow;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO blueyellow;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO blueyellow;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO blueyellow;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO blueyellow;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO blueyellow;

