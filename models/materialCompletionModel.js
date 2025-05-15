const db = require('../config/db');

const MaterialCompletion = {
  async markCompleted(student_id, material_id) {
    const [existing] = await db.query(
      'SELECT * FROM material_completion WHERE student_id = ? AND material_id = ?',
      [student_id, material_id]
    );
    if (existing.length > 0) return;

    await db.query(
      'INSERT INTO material_completion (student_id, material_id) VALUES (?, ?)',
      [student_id, material_id]
    );
  },

  async getCompletedMaterials(student_id) {
    const [rows] = await db.query(
      'SELECT material_id FROM material_completion WHERE student_id = ?',
      [student_id]
    );
    return rows.map(row => row.material_id);
  }
};

module.exports = MaterialCompletion;
