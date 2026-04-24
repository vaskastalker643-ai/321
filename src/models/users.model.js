const pool = require("../db/pool");

async function createUser({ name, email, phone, passwordHash, role = "user" }) {
  const query = `
    INSERT INTO users (name, email, phone, password_hash, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, email, phone, role, created_at;
  `;

  const values = [name, email, phone, passwordHash, role];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

async function findUserByEmail(email) {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1;", [email]);
  return rows[0] || null;
}

async function findUserById(id) {
  const { rows } = await pool.query(
    "SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1;",
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};
