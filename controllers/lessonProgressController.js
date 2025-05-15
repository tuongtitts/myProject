const LessonProgress = require('../models/lessonProgressModel');

// Lấy tiến độ bài học của học sinh
exports.getLessonProgress = async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const lessonId = parseInt(req.params.lessonId);

    if (isNaN(studentId) || isNaN(lessonId)) {
      console.error('Invalid input for getLessonProgress:', { studentId, lessonId });
      return res.status(400).json({ message: 'ID không hợp lệ.' });
    }

    const progress = await LessonProgress.getByStudentAndLesson(studentId, lessonId);
    res.json(progress || {
      progress_percentage: 0,
      is_completed: false,
      completed_at: null,
    });
  } catch (err) {
    console.error('Error in getLessonProgress:', { message: err.message, stack: err.stack, studentId: req.params.studentId, lessonId: req.params.lessonId });
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Tạo hoặc cập nhật tiến độ bài học
exports.createOrUpdateLessonProgress = async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const lessonId = parseInt(req.params.lessonId);
    const { progress_percentage, is_completed } = req.body;

    if (isNaN(studentId) || isNaN(lessonId)) {
      console.error('Invalid input for createOrUpdateLessonProgress:', { studentId, lessonId });
      return res.status(400).json({ message: 'ID không hợp lệ.' });
    }

    if (typeof progress_percentage !== 'number' || progress_percentage < 0 || progress_percentage > 100) {
      console.error('Invalid progress_percentage:', { progress_percentage });
      return res.status(400).json({ message: 'Tiến độ phải là số từ 0 đến 100.' });
    }

    const completed_at = is_completed ? new Date() : null;

    const progressData = {
      student_id: studentId,
      lesson_id: lessonId,
      progress_percentage,
      is_completed,
      completed_at,
    };

    const existing = await LessonProgress.getByStudentAndLesson(studentId, lessonId);

    // Skip update if no changes
    if (
      existing &&
      existing.progress_percentage === progress_percentage &&
      existing.is_completed === is_completed
    ) {
      console.log('No change in progress, skipping update:', { studentId, lessonId, progress_percentage });
      return res.json(existing);
    }

    const io = req.app.get('io');

    if (existing) {
      await LessonProgress.update(progressData);
      if (io) {
        io.to(`student_${studentId}`).emit('lessonProgressUpdated', { studentId, lessonId, progressData });
      }
      return res.json(progressData);
    } else {
      await LessonProgress.create(progressData);
      if (io) {
        io.to(`student_${studentId}`).emit('lessonProgressCreated', { studentId, lessonId, progressData });
      }
      return res.status(201).json(progressData);
    }
  } catch (err) {
    console.error('Error in createOrUpdateLessonProgress:', { message: err.message, stack: err.stack, studentId: req.params.studentId, lessonId: req.params.lessonId });
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Xóa tiến độ bài học
exports.deleteLessonProgress = async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const lessonId = parseInt(req.params.lessonId);

    if (isNaN(studentId) || isNaN(lessonId)) {
      console.error('Invalid input for deleteLessonProgress:', { studentId, lessonId });
      return res.status(400).json({ message: 'ID không hợp lệ.' });
    }

    await LessonProgress.delete(studentId, lessonId);
    const io = req.app.get('io');
    if (io) {
      io.to(`student_${studentId}`).emit('lessonProgressDeleted', { studentId, lessonId });
    }
    res.json({ message: 'Xóa thành công.' });
  } catch (err) {
    console.error('Error in deleteLessonProgress:', { message: err.message, stack: err.stack, studentId: req.params.studentId, lessonId: req.params.lessonId });
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};