// File: src/controllers/lessonController.js
const Lesson = require('../models/lessonModel');
const db = require('../config/db');

exports.createLesson = async (req, res) => {
  try {
    const { course_id, title, content, order_num } = req.body;

    if (!course_id || !title || !order_num) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
    }

    // Kiểm tra khóa học có tồn tại
    const [courses] = await db.query('SELECT id FROM courses WHERE id = ?', [course_id]);
    if (courses.length === 0) {
      return res.status(404).json({ message: 'Khóa học không tồn tại.' });
    }

    const lessonId = await Lesson.create({ course_id, title, content, order_num });
    res.status(201).json({ message: 'Tạo bài học thành công!', lessonId });
  } catch (err) {
    console.error('Error creating lesson:', err);
    res.status(500).json({ message: 'Lỗi khi tạo bài học.' });
  }
};

exports.getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.getByCourseId(courseId);
    res.status(200).json(lessons);
  } catch (err) {
    console.error('Error fetching lessons:', err);
    res.status(500).json({ message: 'Lỗi khi tải danh sách bài học.' });
  }
};

exports.getLessonDetails = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.getById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Bài học không tồn tại.' });
    }
    res.status(200).json(lesson);
  } catch (err) {
    console.error('Error fetching lesson details:', err);
    res.status(500).json({ message: 'Lỗi khi tải chi tiết bài học.' });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, content, order_num } = req.body;

    if (!title || !order_num) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
    }

    const affectedRows = await Lesson.update(lessonId, { title, content, order_num });
    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Bài học không tồn tại.' });
    }

    res.status(200).json({ message: 'Cập nhật bài học thành công!' });
  } catch (err) {
    console.error('Error updating lesson:', err);
    res.status(500).json({ message: 'Lỗi khi cập nhật bài học.' });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const affectedRows = await Lesson.delete(lessonId);
    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Bài học không tồn tại.' });
    }
    res.status(200).json({ message: 'Xóa bài học thành công.' });
  } catch (err) {
    console.error('Error deleting lesson:', err);
    res.status(500).json({ message: 'Lỗi khi xóa bài học.' });
  }
};
