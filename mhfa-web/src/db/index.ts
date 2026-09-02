import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const configuredPoolMax = Number.parseInt(process.env.DATABASE_POOL_MAX ?? "2", 10);
const poolMax = Number.isFinite(configuredPoolMax) && configuredPoolMax > 0
  ? configuredPoolMax
  : 2;

const client = globalForDb.conn ?? postgres(connectionString, {
  prepare: false,
  ssl: "require",
  max: poolMax,
  idle_timeout: 20,
  max_lifetime: 60 * 5,
  connect_timeout: 10,
});

globalForDb.conn = client;

export const db = drizzle(client, { schema });
