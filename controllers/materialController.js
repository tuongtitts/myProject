const Material = require('../models/materialModel');
const MaterialCompletion = require('../models/materialCompletionModel');
const LessonProgress = require('../models/lessonProgressModel');
const path = require('path');
const fs = require('fs').promises;
const db = require('../config/db');

const getMaterials = async (req, res) => {
  try {
    const lessonId = req.query.lesson_id;
    if (!lessonId) {
      return res.status(400).json({ error: 'lesson_id is required' });
    }
    const materials = await Material.getByLessonId(lessonId);
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error.message);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
};

const createMaterial = async (req, res) => {
  try {
    const { title, lesson_id, file_type, file_size } = req.body;
    if (!req.file || !title || !lesson_id || !file_type || !file_size) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const file_path = `/uploads_material/${req.file.filename}`;
    const material = await Material.create({
      title,
      lesson_id,
      file_path,
      file_type,
      file_size: parseInt(file_size),
    });

    // Cập nhật tiến độ cho tất cả học viên có lesson_progress
    const [students] = await db.query(
      'SELECT DISTINCT student_id FROM lesson_progress WHERE lesson_id = ?',
      [lesson_id]
    );
    console.log('Students found for createMaterial (lesson_id:', lesson_id, '):', students);

    const materialsInLesson = await Material.getByLessonId(lesson_id);

    for (const { student_id } of students) {
      const [completionRows] = await db.query(
        `
        SELECT COUNT(*) AS completed_count
        FROM material_completion
        WHERE student_id = ? AND material_id IN (?)
      `,
        [student_id, materialsInLesson.map((m) => m.id)]
      );

      const completedCount = completionRows[0]?.completed_count || 0;
      const total = materialsInLesson.length;
      const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
      const isCompleted = progress === 100;
      const completedAt = isCompleted ? new Date() : null;

      const existing = await LessonProgress.getByStudentAndLesson(student_id, lesson_id);
      if (existing) {
        await LessonProgress.update({
          student_id,
          lesson_id,
          progress_percentage: progress,
          is_completed: isCompleted,
          completed_at: completedAt,
        });
        console.log('Updated lesson progress for student (createMaterial):', {
          student_id,
          lesson_id,
          progress,
        });
      } else if (completedCount > 0) {
        await LessonProgress.create({
          student_id,
          lesson_id,
          progress_percentage: progress,
          is_completed: isCompleted,
          completed_at: completedAt,
        });
        console.log('Created lesson progress for student (createMaterial):', {
          student_id,
          lesson_id,
          progress,
        });
      }
    }

    // Phát sự kiện materialCreated tới room course_${lesson_id}
    if (req.io) {
      console.log('Emitting materialCreated to room course_' + lesson_id, material);
      req.io.to(`course_${lesson_id}`).emit('materialCreated', { material });
    } else {
      console.warn('Socket.IO not available, skipping materialCreated emit');
    }

    res.status(201).json(material);
  } catch (error) {
    console.error('Error uploading material:', error.message);
    res.status(500).json({ error: 'Failed to upload material' });
  }
};

const deleteMaterial = async (req, res) => {
  let transaction;
  try {
    const { id } = req.params;
    console.log('Attempting to delete material id:', id);

    // Kiểm tra material tồn tại
    const material = await Material.getById(id);
    if (!material) {
      console.log('Material not found for id:', id);
      return res.status(404).json({ error: 'Material not found' });
    }

    const lessonId = material.lesson_id;
    console.log('Processing delete for material id:', id, 'lessonId:', lessonId);

    // Bắt đầu transaction
    transaction = await db.getConnection();
    await transaction.beginTransaction();

    // Xóa material_completion liên quan
    await transaction.query('DELETE FROM material_completion WHERE material_id = ?', [id]);
    console.log('Deleted material_completion for materialId:', id);

    // Xóa file trên server (không dừng nếu file không tồn tại)
    const fileName = material.file_path.split('/uploads_material/')[1];
    const filePath = path.join(__dirname, '..', 'public', 'Uploads_material', fileName);
    try {
      await fs.unlink(filePath);
      console.log('Deleted file:', filePath);
    } catch (err) {
      console.warn('File not found or error deleting file:', err.message);
    }

    // Xóa tài liệu khỏi cơ sở dữ liệu
    const [deleteResult] = await transaction.query('DELETE FROM materials WHERE id = ?', [id]);
    if (deleteResult.affectedRows === 0) {
      console.log('Material not found in DB for id:', id);
      throw new Error('Material not found in database');
    }
    console.log('Material deleted successfully from DB for id:', id);

    // Cập nhật tiến độ cho tất cả học viên
    const [students] = await transaction.query(
      'SELECT DISTINCT student_id FROM lesson_progress WHERE lesson_id = ?',
      [lessonId]
    );
    console.log('Students found for deleteMaterial (lessonId:', lessonId, '):', students);

    const remainingMaterials = await Material.getByLessonId(lessonId);
    console.log('Remaining materials after deletion:', remainingMaterials);

    if (remainingMaterials.length === 0) {
      // Nếu không còn tài liệu, xóa tất cả lesson_progress
      await transaction.query('DELETE FROM lesson_progress WHERE lesson_id = ?', [lessonId]);
      console.log('Deleted all lesson progress for lessonId:', lessonId);
    } else {
      for (const { student_id } of students) {
        const [completionRows] = await transaction.query(
          `
          SELECT COUNT(*) AS completed_count
          FROM material_completion
          WHERE student_id = ? AND material_id IN (?)
        `,
          [student_id, remainingMaterials.map((m) => m.id)]
        );

        const completedCount = completionRows[0]?.completed_count || 0;
        const total = remainingMaterials.length;
        const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        const isCompleted = progress === 100;
        const completedAt = isCompleted ? new Date() : null;

        const existing = await LessonProgress.getByStudentAndLesson(student_id, lessonId);
        if (existing) {
          await transaction.query(
            `
            UPDATE lesson_progress
            SET progress_percentage = ?, is_completed = ?, completed_at = ?
            WHERE student_id = ? AND lesson_id = ?
          `,
            [progress, isCompleted, completedAt, student_id, lessonId]
          );
          console.log('Updated lesson progress for student (deleteMaterial):', {
            student_id,
            lessonId,
            progress,
            completedCount,
            total,
          });
        } else {
          console.log('No lesson progress updated for student (no completions):', {
            student_id,
            lessonId,
          });
        }
      }
    }

    // Commit transaction
    await transaction.commit();
    console.log('Transaction committed successfully for materialId:', id);

    // Phát sự kiện materialDeleted tới room course_${lessonId}
    if (req.io) {
      console.log('Emitting materialDeleted to room course_' + lessonId, { materialId: parseInt(id), lessonId: parseInt(lessonId) });
      req.io.to(`course_${lessonId}`).emit('materialDeleted', { materialId: parseInt(id), lessonId: parseInt(lessonId) });
    } else {
      console.warn('Socket.IO not available, skipping materialDeleted emit');
    }

    res.json({ message: 'Material and related data deleted successfully', lessonId });
  } catch (error) {
    console.error('Error deleting material:', error.message, error.stack);
    if (transaction) {
      try {
        await transaction.rollback();
        console.log('Transaction rolled back for materialId:', id);
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError.message);
      }
    }
    res.status(500).json({ error: `Failed to delete material: ${error.message}` });
  } finally {
    if (transaction) {
      transaction.release();
    }
  }
};

module.exports = { getMaterials, createMaterial, deleteMaterial };