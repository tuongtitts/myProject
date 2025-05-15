const UserAnnouncement = require('../models/userAnnouncementModel');
const db = require('../config/db');

const userAnnouncementController = {
  // Lấy danh sách thông báo của người dùng
  async getAnnouncements(req, res) {
    try {
      const userId = req.user.id;
      const { unread } = req.query;
      const announcements = await UserAnnouncement.getByUserId(userId, unread === 'true');
      res.json(announcements);
    } catch (err) {
      console.error('Get announcements error:', err);
      res.status(500).json({ message: 'Lỗi khi lấy thông báo' });
    }
  },

  // Tạo thông báo mới
  async createAnnouncement(req, res) {
    try {
      const { user_id, content, message_id } = req.body;
      if (!user_id || !content) {
        return res.status(400).json({ message: 'Thiếu user_id hoặc nội dung thông báo' });
      }

      // Kiểm tra message_id nếu được cung cấp
      if (message_id) {
        const [message] = await db.query(`SELECT id FROM messages WHERE id = ?`, [message_id]);
        if (!message.length) {
          return res.status(400).json({ message: 'message_id không hợp lệ' });
        }
      }

      const announcementId = await UserAnnouncement.create({ user_id, content, message_id });

      const [newAnnouncement] = await db.query(
        `SELECT ua.*, u.name AS user_name, m.id AS message_id, m.content AS message_content, m.sender_id, m.created_at AS message_created_at
         FROM user_announcements ua
         JOIN users u ON ua.user_id = u.id
         LEFT JOIN messages m ON ua.message_id = m.id
         WHERE ua.id = ?`,
        [announcementId]
      );

      const io = req.app.get('socketio');
      if (io) {
        io.to(`user:${user_id}`).emit('newAnnouncement', newAnnouncement[0]);
        console.log(`Emitted newAnnouncement to user:${user_id}`, newAnnouncement[0]);
      } else {
        console.error('Socket.IO not initialized for newAnnouncement');
      }

      res.json({ message: 'Tạo thông báo thành công', data: newAnnouncement[0] });
    } catch (err) {
      console.error('Create announcement error:', err);
      res.status(500).json({ message: 'Lỗi khi tạo thông báo' });
    }
  },

  // Tạo thông báo cho tất cả người dùng
  async createAnnouncementForAll(req, res) {
    try {
      const { content, message_id } = req.body;
      const role = req.user.role;
      if (!['admin', 'teacher'].includes(role)) {
        return res.status(403).json({ message: 'Chỉ admin hoặc teacher mới có quyền gửi thông báo cho tất cả' });
      }

      if (!content) {
        return res.status(400).json({ message: 'Thiếu nội dung thông báo' });
      }

      if (message_id) {
        const [message] = await db.query(`SELECT id FROM messages WHERE id = ?`, [message_id]);
        if (!message.length) {
          return res.status(400).json({ message: 'message_id không hợp lệ' });
        }
      }

      const [users] = await db.query(`SELECT id FROM users`);
      if (!users.length) {
        return res.status(404).json({ message: 'Không có người dùng nào để gửi thông báo' });
      }

      const announcements = await Promise.all(
        users.map(async ({ id: user_id }) => {
          const [result] = await db.query(
            `INSERT INTO user_announcements (user_id, content, message_id) VALUES (?, ?, ?)`,
            [user_id, content, message_id || null]
          );
          return result.insertId;
        })
      );

      const [newAnnouncements] = await db.query(
        `SELECT ua.*, u.name AS user_name, m.id AS message_id, m.content AS message_content, m.sender_id, m.created_at AS message_created_at
         FROM user_announcements ua
         JOIN users u ON ua.user_id = u.id
         LEFT JOIN messages m ON ua.message_id = m.id
         WHERE ua.id IN (?)`,
        [announcements]
      );

      const io = req.app.get('socketio');
      if (io) {
        newAnnouncements.forEach((announcement) => {
          io.to(`user:${announcement.user_id}`).emit('newAnnouncement', announcement);
          console.log(`Emitted newAnnouncement to user:${announcement.user_id}`, announcement);
        });
      } else {
        console.error('Socket.IO not initialized for newAnnouncement');
      }

      res.json({ message: 'Gửi thông báo đến tất cả người dùng thành công', data: newAnnouncements });
    } catch (err) {
      console.error('Create announcement for all error:', err);
      res.status(500).json({ message: 'Lỗi khi gửi thông báo đến tất cả người dùng' });
    }
  },

  // Đánh dấu thông báo là đã đọc
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const updated = await UserAnnouncement.markAsRead(id, userId);
      if (updated === 0) {
        return res.status(403).json({ message: 'Không có quyền hoặc thông báo không tồn tại' });
      }

      const io = req.app.get('socketio');
      if (io) {
        io.to(`user:${userId}`).emit('announcementRead', { id: parseInt(id) });
        console.log(`Emitted announcementRead to user:${userId}`, { id: parseInt(id) });
      } else {
        console.error('Socket.IO not initialized for announcementRead');
      }

      res.json({ message: 'Đánh dấu thông báo đã đọc thành công', id });
    } catch (err) {
      console.error('Mark announcement read error:', err);
      res.status(500).json({ message: 'Lỗi khi đánh dấu thông báo' });
    }
  },

  // Xóa thông báo
  async deleteAnnouncement(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const deleted = await UserAnnouncement.delete(id, userId);
      if (deleted === 0) {
        return res.status(403).json({ message: 'Không có quyền hoặc thông báo không tồn tại' });
      }

      const io = req.app.get('socketio');
      if (io) {
        io.to(`user:${userId}`).emit('announcementDeleted', { id: parseInt(id) });
        console.log(`Emitted announcementDeleted to user:${userId}`, { id: parseInt(id) });
      } else {
        console.error('Socket.IO not initialized for announcementDeleted');
      }

      res.json({ message: 'Xóa thông báo thành công', id });
    } catch (err) {
      console.error('Delete announcement error:', err);
      res.status(500).json({ message: 'Lỗi khi xóa thông báo' });
    }
  },
};

module.exports = userAnnouncementController;