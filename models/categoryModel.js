const db = require('../config/db');

const Category = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY created_at DESC');
    return rows;
  },

  async create(name) {
    const [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
    return result.insertId;
  },

  async delete(id) {
    await db.query('DELETE FROM categories WHERE id = ?', [id]);
  }
};

module.exports = Category;
