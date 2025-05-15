const db = require('../config/db');

class Material {
  static async getByLessonId(lessonId) {
    const [rows] = await db.query(
      'SELECT id, title, file_path, file_type, file_size, uploaded_at FROM materials WHERE lesson_id = ?',
      [lessonId]
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query(
      'SELECT id, title, file_path, file_type, file_size, uploaded_at FROM materials WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async create({ title, lesson_id, file_path, file_type, file_size }) {
    const [result] = await db.query(
      'INSERT INTO materials (title, lesson_id, file_path, file_type, file_size) VALUES (?, ?, ?, ?, ?)',
      [title, lesson_id, file_path, file_type, file_size]
    );
    return { id: result.insertId, title, lesson_id, file_path, file_type, file_size, uploaded_at: new Date() };
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM materials WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Material;