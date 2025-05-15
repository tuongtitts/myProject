const db = require('../config/db');
const User = require('./userModel');

const Announcement = {
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT id, sender_id, content, file_attachment, created_at
      FROM announcements
      ORDER BY created_at DESC
    `);

    const results = await Promise.all(
      rows.map(async (announcement) => {
        const user = announcement.sender_id ? await User.getUserById(announcement.sender_id) : null;
        return {
          ...announcement,
          publisher: user ? user.name : 'Không rõ',
        };
      })
    );

    return results;
  },

  create: async (sender_id, content, file_attachment) => {
    const [result] = await db.query(
      'INSERT INTO announcements (sender_id, content, file_attachment) VALUES (?, ?, ?)',
      [sender_id, content, file_attachment]
    );
    return result;
  },

  update: async (id, sender_id, content, file_attachment) => {
    const [result] = await db.query(
      'UPDATE announcements SET sender_id=?, content=?, file_attachment=? WHERE id=?',
      [sender_id, content, file_attachment, id]
    );
    return result;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM announcements WHERE id = ?', [id]);
    return result;
  }
};

module.exports = Announcement;
