const bcrypt = require("bcryptjs");
const fs = require("fs/promises");
const path = require("path");
const pool = require("./pool");

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations() {
  const result = await pool.query("SELECT filename FROM schema_migrations;");
  return new Set(result.rows.map((row) => row.filename));
}

async function applyMigration(filename, sql) {
  await pool.query("BEGIN;");
  try {
    await pool.query(sql);
    await pool.query("INSERT INTO schema_migrations (filename) VALUES ($1);", [filename]);
    await pool.query("COMMIT;");
    console.log(`Applied migration: ${filename}`);
  } catch (error) {
    await pool.query("ROLLBACK;");
    throw error;
  }
}

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not set. Skipping migrations.");
    return;
  }

  const migrationsDir = path.join(__dirname, "..", "..", "migrations");
  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }

    const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
    await applyMigration(file, sql);
  }
}

async function seedAdminIfNeeded() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (!process.env.DATABASE_URL) {
    return;
  }
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn("ADMIN_EMAIL or ADMIN_PASSWORD is not set. Skipping admin seed.");
    return;
  }

  const existingAdmin = await pool.query(
    "SELECT id FROM users WHERE role = 'admin' LIMIT 1;"
  );
  if (existingAdmin.rows.length > 0) {
    return;
  }

  const name = ADMIN_NAME || "Administrator";
  const email = String(ADMIN_EMAIL).toLowerCase().trim();
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const existingUser = await pool.query("SELECT id FROM users WHERE email = $1;", [email]);

  if (existingUser.rows.length > 0) {
    await pool.query(
      `
        UPDATE users
        SET role = 'admin', password_hash = $2, name = $3
        WHERE id = $1;
      `,
      [existingUser.rows[0].id, passwordHash, name]
    );
    console.log(`Promoted existing user to admin: ${email}`);
    return;
  }

  await pool.query(
    `
      INSERT INTO users (name, email, phone, password_hash, role)
      VALUES ($1, $2, $3, $4, 'admin');
    `,
    [name, email, "+79000000001", passwordHash]
  );
  console.log(`Created admin user: ${email}`);
}

async function bootstrapDatabase() {
  await runMigrations();
  await seedAdminIfNeeded();
}

module.exports = {
  bootstrapDatabase,
  runMigrations,
  seedAdminIfNeeded,
};
