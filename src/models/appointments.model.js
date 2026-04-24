const pool = require("../db/pool");

async function createAppointment({ userId, service, appointmentDate, appointmentTime, comment = null }) {
  const query = `
    INSERT INTO appointments (user_id, service, appointment_date, appointment_time, comment)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, user_id, service, appointment_date, appointment_time, status, comment, created_at;
  `;
  const values = [userId, service, appointmentDate, appointmentTime, comment];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

async function getAppointmentsByUser(userId) {
  const { rows } = await pool.query(
    `
      SELECT id, user_id, service, appointment_date, appointment_time, status, comment, created_at
      FROM appointments
      WHERE user_id = $1
      ORDER BY appointment_date DESC, appointment_time DESC;
    `,
    [userId]
  );
  return rows;
}

async function getAllAppointments() {
  const { rows } = await pool.query(`
    SELECT a.id, a.user_id, u.name AS user_name, u.phone AS user_phone, a.service, a.appointment_date, a.appointment_time, a.status, a.comment, a.created_at
    FROM appointments a
    INNER JOIN users u ON u.id = a.user_id
    ORDER BY a.appointment_date DESC, a.appointment_time DESC;
  `);
  return rows;
}

async function updateAppointmentStatus(id, status) {
  const { rows } = await pool.query(
    `
      UPDATE appointments
      SET status = $2
      WHERE id = $1
      RETURNING id, user_id, service, appointment_date, appointment_time, status, comment, created_at;
    `,
    [id, status]
  );
  return rows[0] || null;
}

module.exports = {
  createAppointment,
  getAppointmentsByUser,
  getAllAppointments,
  updateAppointmentStatus,
};
