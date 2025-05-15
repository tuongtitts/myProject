// adminController.js
const { getAllUsers } = require("../models/userModel");
const db = require('../config/db');
const bcrypt = require("bcryptjs");

const formatDate = (date) => {
    if (!date) return "Không có"; 
    return new Date(date).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
};


const getAllUsersHandler = async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        console.error(" Lỗi getAllUsers:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

const createUser = async (req, res) => {
    try {
        const { id, name, role } = req.body;
        if (!id || !name || !role) {
            return res.status(400).json({ message: "Thiếu thông tin id, name hoặc role" });
        }

        const [existingUser] = await db.query("SELECT id FROM users WHERE id = ?", [id]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: "ID đã tồn tại" });
        }

        const defaultPassword = `${id}@1`;
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        await db.query(
            "INSERT INTO users (id, name, role, password_hash) VALUES (?, ?, ?, ?)",
            [id, name, role, hashedPassword]
        );

        res.status(201).json({ message: "Tạo người dùng thành công" });
    } catch (error) {
        console.error(" Lỗi createUser:", error);
        res.status(500).json({ message: "Lỗi server khi tạo người dùng" });
    }
};


const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, status, role } = req.body;

        if (role) {
            return res.status(400).json({ message: "Không được phép cập nhật vai trò" });
        }

        const [result] = await db.query(
            "UPDATE users SET name = ?, status = ? WHERE id = ?",
            [name, status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng để cập nhật" });
        }

        res.json({ message: "Cập nhật người dùng thành công" });
    } catch (error) {
        console.error(" Lỗi updateUser:", error);
        res.status(500).json({ message: "Không thể cập nhật người dùng" });
    }
};


const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const newPassword = `${id}@1`;
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const [result] = await db.query(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            [hashedPassword, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng để reset mật khẩu" });
        }

        res.json({ message: `Đặt lại mật khẩu thành công: ${newPassword}` });
    } catch (error) {
        console.error(" Lỗi resetPassword:", error);
        res.status(500).json({ message: "Không thể reset mật khẩu người dùng" });
    }
};
const deleteUser = async (req, res) => {
    const { id } = req.params;
    
    try {
        const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng để xóa" });
        }

        res.json({ message: "Xóa người dùng thành công" });
    } catch (error) {
        console.error(" Lỗi deleteUser:", error);
        res.status(500).json({ message: "Không thể xóa người dùng" });
    }
};

module.exports = {
    getAllUsers: getAllUsersHandler,
    createUser,
    updateUser,
    resetPassword,
    deleteUser,
};