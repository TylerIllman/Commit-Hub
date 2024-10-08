import { PrismaClient } from "@prisma/client";

import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

// TODO: Convert this to use the env.js file so it is dynamic
const libsql = createClient({
  url: `${process.env.DATABASE_URL}`,
  authToken: `${process.env.TURSO_AUTH_TOKEN}`,
});

const adapter = new PrismaLibSQL(libsql);

export const db = new PrismaClient({ adapter });

// const createPrismaClient = () =>
//   new PrismaClient({
//     log:
//       env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
//   });
//
// const globalForPrisma = globalThis as unknown as {
//   prisma: ReturnType<typeof createPrismaClient> | undefined;
// };
//
// export const db = globalForPrisma.prisma ?? createPrismaClient();
//
// if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
