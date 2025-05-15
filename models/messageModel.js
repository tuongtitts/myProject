const db = require('../config/db');

const Message = {
  async getAll() {
    const [rows] = await db.query(`
      SELECT m.*, u.name AS sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      ORDER BY m.created_at ASC
    `);
    return rows;
  },

  async create({ sender_id, content }) {
    const [result] = await db.query(
      `INSERT INTO messages (sender_id, content) VALUES (?, ?)`,
      [sender_id, content]
    );
    return result.insertId;
  },

  async delete(messageId, senderId) {
    const [result] = await db.query(
      `DELETE FROM messages WHERE id = ? AND sender_id = ?`,
      [messageId, senderId]
    );
    return result.affectedRows;
  }
};

module.exports = Message;
