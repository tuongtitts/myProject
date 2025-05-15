
const db = require('../config/db');

const Lesson = {
  async create({ course_id, title, content, order_num }) {
    const [result] = await db.query(
      'INSERT INTO lessons (course_id, title, content, order_num) VALUES (?, ?, ?, ?)',
      [course_id, title, content, order_num]
    );
    return result.insertId;
  },

  async getByCourseId(courseId) {
    const [rows] = await db.query(
      'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_num ASC',
      [courseId]
    );
    return rows;
  },

  async getById(lessonId) {
    const [rows] = await db.query('SELECT * FROM lessons WHERE id = ?', [lessonId]);
    return rows[0];
  },

  async update(lessonId, { title, content, order_num }) {
    const [result] = await db.query(
      'UPDATE lessons SET title = ?, content = ?, order_num = ? WHERE id = ?',
      [title, content, order_num, lessonId]
    );
    return result.affectedRows;
  },

  async delete(lessonId) {
    const [result] = await db.query('DELETE FROM lessons WHERE id = ?', [lessonId]);
    return result.affectedRows;
  }
};

module.exports = Lesson;