const path = require("path");
const fs = require("fs");
const db = require("../config/db");
const Announcement = require('../models/announcementModel');
const { getUserById } = require('../models/userModel');

// Lấy tất cả
exports.getAll = async (req, res) => {
  try {
    const results = await Announcement.getAll();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
};

// Tạo mới
exports.create = async (req, res, io) => {
  try {
    const content = req.body.content;
    const file_attachment = req.file ? req.file.filename : null;
    const sender_id = req.user?.id;

    if (!sender_id) {
      return res.status(401).json({ message: "Không xác định được người gửi" });
    }

    const result = await Announcement.create(sender_id, content, file_attachment);
    const user = await getUserById(sender_id);

    const newAnnouncement = {
      id: result.insertId,
      sender_id,
      content,
      file_attachment,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      publisher: user ? user.name : "Không rõ",
    };

    if (io) {
      io.emit("announcementUpdated", newAnnouncement); 
      console.log(" Emit: announcementUpdated (created)");
    }

    res.status(201).json({ message: "Gửi thông báo thành công", data: newAnnouncement });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi máy chủ khi thêm thông báo" });
  }
};

// Sửa
exports.update = async (req, res, io) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const file_attachment = req.file ? req.file.filename : null;

    await db.query(
      "UPDATE announcements SET content = ?, file_attachment = ? WHERE id = ?",
      [content, file_attachment, id]
    );

    const updatedItem = {
      id: parseInt(id),
      content,
      file_attachment,
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };

    if (io) {
      io.emit("announcementUpdated", updatedItem);
      console.log("Emit: announcementUpdated (updated)");
    }

    res.status(200).json({ message: "Cập nhật thông báo thành công", data: updatedItem });
  } catch (err) {
    console.error("Lỗi khi cập nhật:", err);
    res.status(500).json({ message: "Lỗi khi cập nhật thông báo" });
  }
};

exports.delete = async (req, res, io) => {
  try {
    const { id } = req.params;

    // Lấy thông tin file đính kèm
    const [rows] = await db.query("SELECT file_attachment FROM announcements WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Thông báo không tồn tại" });
    }

    const fileName = rows[0].file_attachment;

    // Nếu có file thì kiểm tra và xóa
    if (fileName) {
      const filePath = path.resolve(__dirname, "../public/uploads", fileName);

      // Kiểm tra file có tồn tại không
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath); // dùng unlinkSync để đảm bảo đã xóa trước khi tiếp tục
          console.log("Đã xóa file đính kèm:", filePath);
        } catch (fileErr) {
          console.error(" Không thể xóa file:", fileErr.message);
          return res.status(500).json({ message: "Không thể xóa file đính kèm" });
        }
      } else {
        console.warn("File không tồn tại:", filePath);
      }
    }

    // Sau khi xóa file xong mới xóa bản ghi trong DB
    await db.query("DELETE FROM announcements WHERE id = ?", [id]);

    if (io) {
      io.emit("announcementDeleted", { id: parseInt(id) });
      console.log(" Emit: announcementDeleted");
    }

    res.status(200).json({ message: "Xóa thông báo thành công" });

  } catch (err) {
    console.error("Lỗi khi xóa thông báo:", err);
    res.status(500).json({ message: "Lỗi khi xóa thông báo" });
  }
};