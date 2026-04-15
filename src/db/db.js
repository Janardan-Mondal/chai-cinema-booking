import { Pool } from "pg";

let pool;

export const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    console.log("DB Pool created");
  }
  return pool;
};
