const Message = require('../models/messageModel');
const db = require('../config/db');

const messageController = {
  async getMessages(req, res) {
    try {
      const messages = await Message.getAll();
      res.json(messages);
    } catch (err) {
      console.error('Get messages error:', err);
      res.status(500).json({ message: 'Lỗi khi lấy tin nhắn' });
    }
  },

  async createMessage(req, res) {
    try {
      const { content } = req.body;
      const sender_id = req.user?.id;

      if (!sender_id || !content) {
        return res.status(400).json({ message: 'Thiếu sender_id hoặc nội dung tin nhắn' });
      }

      // Tạo tin nhắn
      const messageId = await Message.create({ sender_id, content });

      // Lấy tin nhắn vừa tạo
      const [newMessage] = await db.query(
        `SELECT m.*, u.name AS sender_name
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.id = ?`,
        [messageId]
      );

      // Lấy danh sách tất cả người dùng (trừ người gửi)
      const [users] = await db.query(`SELECT id FROM users WHERE id != ?`, [sender_id]);
      if (!users.length) {
        console.warn('No users found to send announcements');
      } else {
        // Tạo thông báo cho tất cả người dùng
        const announcementContent = `Tin nhắn mới trong chat lớp từ ${req.user.name}: ${content}`;
        const announcements = await Promise.all(
          users.map(async ({ id: user_id }) => {
            const [result] = await db.query(
              `INSERT INTO user_announcements (user_id, content, message_id) VALUES (?, ?, ?)`,
              [user_id, announcementContent, messageId]
            );
            return result.insertId;
          })
        );

        // Lấy thông báo vừa tạo
        const [newAnnouncements] = await db.query(
          `SELECT ua.*, u.name AS user_name, m.id AS message_id, m.content AS message_content, m.sender_id, m.created_at AS message_created_at
           FROM user_announcements ua
           JOIN users u ON ua.user_id = u.id
           LEFT JOIN messages m ON ua.message_id = m.id
           WHERE ua.id IN (?)`,
          [announcements]
        );

        // Phát sự kiện Socket.IO cho thông báo
        const io = req.app.get('socketio');
        if (io) {
          newAnnouncements.forEach((announcement) => {
            io.to(`user:${announcement.user_id}`).emit('newAnnouncement', announcement);
            console.log(`Emitted newAnnouncement to user:${announcement.user_id}`, announcement);
          });
        } else {
          console.error('Socket.IO not initialized for newAnnouncement');
        }
      }

      // Phát sự kiện Socket.IO cho tin nhắn
      const io = req.app.get('socketio');
      if (io) {
        io.emit('newMessage', newMessage[0]);
        console.log('Emitted newMessage to all', newMessage[0]);
      } else {
        console.error('Socket.IO not initialized for newMessage');
      }

      res.json({ message: 'Gửi tin nhắn thành công', data: newMessage[0] });
    } catch (err) {
      console.error('Create message error:', err);
      res.status(500).json({ message: 'Lỗi khi gửi tin nhắn' });
    }
  },

  async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;
      const senderId = req.user.id;

      const deleted = await Message.delete(messageId, senderId);
      if (deleted === 0) {
        return res.status(403).json({ message: 'Không có quyền xóa hoặc tin nhắn không tồn tại' });
      }

      const io = req.app.get('socketio');
      if (io) {
        io.emit('deleteMessage', { messageId: parseInt(messageId) });
        console.log(`Emitted deleteMessage for messageId:${messageId}`);
      } else {
        console.error('Socket.IO not initialized for deleteMessage');
      }

      res.json({ message: 'Xóa tin nhắn thành công', messageId });
    } catch (err) {
      console.error('Delete message error:', err);
      res.status(500).json({ message: 'Lỗi khi xóa tin nhắn' });
    }
  }
};

module.exports = messageController;