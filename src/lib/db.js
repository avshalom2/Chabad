import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const dbType = process.env.DB_TYPE || "mysql";

let poolPromise;
if (dbType === "postgres" || dbType === "pg") {
  poolPromise = import("./db.pg.js").then((m) => m.default);
} else {
  poolPromise = import("./db.mysql.js").then((m) => m.default);
}

export async function getPool() {
  return poolPromise;
}
