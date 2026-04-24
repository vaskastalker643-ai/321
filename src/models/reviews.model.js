const pool = require("../db/pool");

async function createReview({ userId, text, rating }) {
  const query = `
    INSERT INTO reviews (user_id, text, rating)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, text, rating, review_date, moderation_status, created_at;
  `;
  const { rows } = await pool.query(query, [userId, text, rating]);
  return rows[0];
}

async function getApprovedReviews() {
  const { rows } = await pool.query(`
    SELECT r.id, r.user_id, u.name AS user_name, r.text, r.rating, r.review_date, r.moderation_status, r.created_at
    FROM reviews r
    INNER JOIN users u ON u.id = r.user_id
    WHERE r.moderation_status = 'approved'
    ORDER BY r.created_at DESC;
  `);
  return rows;
}

async function getAllReviews() {
  const { rows } = await pool.query(`
    SELECT r.id, r.user_id, u.name AS user_name, r.text, r.rating, r.review_date, r.moderation_status, r.created_at
    FROM reviews r
    INNER JOIN users u ON u.id = r.user_id
    ORDER BY r.created_at DESC;
  `);
  return rows;
}

async function getReviewsByUser(userId) {
  const { rows } = await pool.query(
    `
      SELECT id, user_id, text, rating, review_date, moderation_status, created_at
      FROM reviews
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `,
    [userId]
  );
  return rows;
}

async function updateReviewModerationStatus(id, moderationStatus) {
  const { rows } = await pool.query(
    `
      UPDATE reviews
      SET moderation_status = $2
      WHERE id = $1
      RETURNING id, user_id, text, rating, review_date, moderation_status, created_at;
    `,
    [id, moderationStatus]
  );
  return rows[0] || null;
}

async function deleteReview(id) {
  const { rowCount } = await pool.query("DELETE FROM reviews WHERE id = $1;", [id]);
  return rowCount > 0;
}

module.exports = {
  createReview,
  getApprovedReviews,
  getAllReviews,
  getReviewsByUser,
  updateReviewModerationStatus,
  deleteReview,
};
