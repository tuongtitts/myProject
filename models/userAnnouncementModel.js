const db = require('../config/db');

const UserAnnouncement = {
  async getByUserId(userId, onlyUnread = false) {
    const query = `
      SELECT ua.*, u.name AS user_name, m.id AS message_id, m.content AS message_content, m.sender_id, m.created_at AS message_created_at
      FROM user_announcements ua
      JOIN users u ON ua.user_id = u.id
      LEFT JOIN messages m ON ua.message_id = m.id
      WHERE ua.user_id = ? ${onlyUnread ? 'AND ua.is_read = FALSE' : ''}
      ORDER BY ua.created_at DESC
    `;
    const [rows] = await db.query(query, [userId]);
    return rows;
  },

  async create({ user_id, content, message_id }) {
    const [result] = await db.query(
      `INSERT INTO user_announcements (user_id, content, message_id) VALUES (?, ?, ?)`,
      [user_id, content, message_id || null]
    );
    return result.insertId;
  },

  async markAsRead(id, userId) {
    const [result] = await db.query(
      `UPDATE user_announcements SET is_read = TRUE WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    return result.affectedRows;
  },

  async delete(id, userId) {
    const [result] = await db.query(
      `DELETE FROM user_announcements WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    return result.affectedRows;
  }
};

module.exports = UserAnnouncement;