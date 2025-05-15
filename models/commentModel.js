const db = require('../config/db');

const Comment = {
  async getByLessonId(lessonId) {
    const [rows] = await db.query(
      `SELECT c.*, u.name AS user_name 
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.lesson_id = ?
       ORDER BY c.created_at ASC`,
      [lessonId]
    );
    return rows;
  },

  async create({ user_id, lesson_id, content, parent_id = null }) {
    const [result] = await db.query(
      `INSERT INTO comments (user_id, lesson_id, content, parent_id)
       VALUES (?, ?, ?, ?)`,
      [user_id, lesson_id, content, parent_id]
    );
    return result.insertId;
  },

  async delete(commentId, userId) {
    const [result] = await db.query(
      `DELETE FROM comments WHERE id = ? AND user_id = ?`,
      [commentId, userId]
    );
    return result.affectedRows;
  }
};

module.exports = Comment;