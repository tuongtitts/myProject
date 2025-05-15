const pool = require('../config/db');

class LessonProgress {
  static async getByStudentAndLesson(studentId, lessonId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM lesson_progress WHERE student_id = ? AND lesson_id = ?',
        [studentId, lessonId]
      );
      return rows[0];
    } catch (err) {
      console.error('Error in LessonProgress.getByStudentAndLesson:', err.message, err.stack);
      throw err;
    }
  }

  static async create(data) {
    try {
      const [result] = await pool.query(
        'INSERT INTO lesson_progress (student_id, lesson_id, progress_percentage, is_completed, completed_at) VALUES (?, ?, ?, ?, ?)',
        [
          data.student_id,
          data.lesson_id,
          data.progress_percentage,
          data.is_completed,
          data.completed_at,
        ]
      );
      return result.insertId;
    } catch (err) {
      console.error('Error in LessonProgress.create:', err.message, err.stack);
      throw err;
    }
  }

  static async update(data) {
    try {
      const [result] = await pool.query(
        'UPDATE lesson_progress SET progress_percentage = ?, is_completed = ?, completed_at = ? WHERE student_id = ? AND lesson_id = ?',
        [
          data.progress_percentage,
          data.is_completed,
          data.completed_at,
          data.student_id,
          data.lesson_id,
        ]
      );
      return result.affectedRows;
    } catch (err) {
      console.error('Error in LessonProgress.update:', err.message, err.stack);
      throw err;
    }
  }

  static async delete(studentId, lessonId) {
    try {
      const [result] = await pool.query(
        'DELETE FROM lesson_progress WHERE student_id = ? AND lesson_id = ?',
        [studentId, lessonId]
      );
      return result.affectedRows;
    } catch (err) {
      console.error('Error in LessonProgress.delete:', err.message, err.stack);
      throw err;
    }
  }
}

module.exports = LessonProgress;