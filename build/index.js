import { env } from "#env";
import { bootstrap } from "@constatic/base";
import { initDatabase } from "#database";
await initDatabase();
await bootstrap({ meta: import.meta, env });
