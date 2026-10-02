import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/fallback_db";

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const configuredPoolMax = Number.parseInt(process.env.DATABASE_POOL_MAX ?? "2", 10);
const poolMax = Number.isFinite(configuredPoolMax) && configuredPoolMax > 0
  ? configuredPoolMax
  : 2;

const isLocalDb = Boolean(
  connectionString && (
    connectionString.includes('localhost') ||
    connectionString.includes('127.0.0.1') ||
    connectionString.includes('mhfa-postgres') ||
    connectionString.includes('postgres') ||
    connectionString.includes('sslmode=disable') ||
    process.env.DATABASE_SSL === 'false'
  )
);

const client = globalForDb.conn ?? postgres(connectionString, {
  prepare: false,
  ssl: isLocalDb ? false : "require",
  max: poolMax,
  idle_timeout: 20,
  max_lifetime: 60 * 5,
  connect_timeout: 10,
});

globalForDb.conn = client;

export const db = drizzle(client, { schema });
