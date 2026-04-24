const bcrypt = require("bcryptjs");
const pool = require("../src/db/pool");

async function run() {
  const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  }

  const name = ADMIN_NAME || "Administrator";
  const email = String(ADMIN_EMAIL).toLowerCase().trim();
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const existing = await pool.query("SELECT id FROM users WHERE email = $1;", [email]);

  if (existing.rows.length > 0) {
    const userId = existing.rows[0].id;
    await pool.query(
      `
        UPDATE users
        SET role = 'admin', password_hash = $2, name = $3
        WHERE id = $1;
      `,
      [userId, passwordHash, name]
    );
    console.log(`Updated existing user as admin: ${email}`);
  } else {
    await pool.query(
      `
        INSERT INTO users (name, email, phone, password_hash, role)
        VALUES ($1, $2, $3, $4, 'admin');
      `,
      [name, email, "+70000000000", passwordHash]
    );
    console.log(`Created new admin user: ${email}`);
  }
}

run()
  .then(async () => {
    await pool.end();
    console.log("Admin seed complete.");
  })
  .catch(async (error) => {
    console.error("Admin seed failed:", error.message);
    await pool.end();
    process.exit(1);
  });
