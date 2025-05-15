const db = require('../config/db');

const Course = {
  async getByCategory(categoryId) {
    const [rows] = await db.query(`
      SELECT c.*, cat.name as category_name 
      FROM courses c 
      JOIN categories cat ON c.category_id = cat.id 
      WHERE c.category_id = ? 
      ORDER BY c.created_at DESC
    `, [categoryId]);
    return rows;
  },

  async create({ id, name, description, category_id, teacher_id, start_date, end_date }) {
    const [result] = await db.query(
      'INSERT INTO courses (id, name, description, category_id, teacher_id, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, description, category_id, teacher_id, start_date, end_date]
    );
    return id || result.insertId; // Trả về id do client gửi hoặc insertId nếu không có id
  },

  async delete(id) {
    await db.query('DELETE FROM courses WHERE id = ?', [id]);
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
    return rows[0];
  }
};

module.exports = Course;