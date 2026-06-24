const pool = require("../src/db/pool");
const { seedAdminIfNeeded } = require("../src/db/bootstrap");

async function run() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  }

  const existingAdmin = await pool.query(
    "SELECT id FROM users WHERE role = 'admin' LIMIT 1;"
  );
  if (existingAdmin.rows.length > 0) {
    const { ADMIN_EMAIL } = process.env;
    const email = String(ADMIN_EMAIL).toLowerCase().trim();
    const passwordHash = await require("bcryptjs").hash(process.env.ADMIN_PASSWORD, 10);
    await pool.query(
      `
        UPDATE users
        SET role = 'admin', password_hash = $2, name = $3
        WHERE email = $1;
      `,
      [email, passwordHash, process.env.ADMIN_NAME || "Administrator"]
    );
    console.log(`Updated admin credentials: ${email}`);
  } else {
    await seedAdminIfNeeded();
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
