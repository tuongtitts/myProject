const Comment = require('../models/commentModel');
const db = require('../config/db');

const commentController = {
  async getCommentsByLesson(req, res) {
    try {
      const lessonId = req.params.lessonId;
      const comments = await Comment.getByLessonId(lessonId);
      res.json(comments);
    } catch (err) {
      console.error('Get comments error:', err);
      res.status(500).json({ message: 'Lỗi khi lấy bình luận' });
    }
  },

  async createComment(req, res) {
    try {
      const { lesson_id, content, parent_id } = req.body;
      const user_id = req.user.id;

      if (!user_id || !lesson_id || !content) {
        return res.status(400).json({ message: 'Thiếu thông tin' });
      }

      const commentId = await Comment.create({ user_id, lesson_id, content, parent_id });

      const [newComment] = await db.query(
        `SELECT c.*, u.name AS user_name 
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.id = ?`,
        [commentId]
      );

      const io = req.app.get('socketio');
      if (io) {
        console.log('Emitting newComment:', newComment[0]);
        io.emit('newComment', newComment[0]);
      } else {
        console.error('Socket.io not initialized');
      }

      res.json({ message: 'Tạo bình luận thành công', comment: newComment[0] });
    } catch (err) {
      console.error('Create comment error:', err);
      res.status(500).json({ message: 'Lỗi khi tạo bình luận' });
    }
  },

  async deleteComment(req, res) {
    try {
      const { commentId } = req.params;
      const user_id = req.user.id;
      const { lesson_id } = req.body;

      if (!user_id || !lesson_id) {
        return res.status(400).json({ message: 'Thiếu thông tin' });
      }

      const deleted = await Comment.delete(commentId, user_id);
      if (deleted === 0) {
        return res.status(403).json({ message: 'Không có quyền xóa hoặc bình luận không tồn tại' });
      }

      const io = req.app.get('socketio');
      if (io) {
        console.log('Emitting deleteComment:', { commentId: parseInt(commentId), lesson_id: parseInt(lesson_id) });
        io.emit('deleteComment', { commentId: parseInt(commentId), lesson_id: parseInt(lesson_id) });
      } else {
        console.error('Socket.io not initialized');
      }

      res.json({ message: 'Xóa bình luận thành công', commentId });
    } catch (err) {
      console.error('Delete comment error:', err);
      res.status(500).json({ message: 'Lỗi khi xóa bình luận' });
    }
  }
};

module.exports = commentController;