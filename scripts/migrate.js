const pool = require("../src/db/pool");
const { runMigrations } = require("../src/db/bootstrap");

async function run() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to run migrations.");
  }
  await runMigrations();
}

run()
  .then(async () => {
    await pool.end();
    console.log("Migrations complete.");
  })
  .catch(async (error) => {
    console.error("Migration failed:", error.message);
    await pool.end();
    process.exit(1);
  });
