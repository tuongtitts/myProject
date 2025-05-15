const { getUserById } = require("../models/userModel");
const bcrypt = require("bcryptjs");
const db = require('../config/db');

const formatDate = (date) => {
    if (!date) return "Không có";
    return new Date(date).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await getUserById(userId);
        if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

        delete user.password_hash;

        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email || "Chưa cập nhật",
            role: user.role,
            status: user.status,
            isOnline: user.isOnline,
            created_at: formatDate(user.created_at),
            last_login: formatDate(user.last_login),
        });
    } catch (error) {
        console.error("Lỗi getProfile:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Vui lòng cung cấp email và mật khẩu" });
        }

        const [users] = await db.query(
            "SELECT id, name, email, role, password_hash FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: "Email không tồn tại" });
        }

        const user = users[0];
        if (!user.password_hash) {
            return res.status(401).json({ message: "Mật khẩu không đúng" });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Mật khẩu không đúng" });
        }

        const [updateResult] = await db.query(
            "UPDATE users SET last_login = NOW() WHERE id = ?",
            [user.id]
        );
        console.log("Kết quả cập nhật last_login:", updateResult);

        res.status(200).json({
            message: "Đăng nhập thành công",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                last_login: formatDate(new Date()),
            },
        });
    } catch (error) {
        console.error("Lỗi login:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi đăng nhập" });
    }
};

const logout = async (req, res) => {
    try {
        const userId = req.user.id;
        await db.query("UPDATE users SET isOnline = 0 WHERE id = ?", [userId]);
        res.status(200).json({ message: "Đăng xuất thành công" });
    } catch (error) {
        console.error("Lỗi logout:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi đăng xuất" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { email, currentPassword, newPassword } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!email && !newPassword) {
            return res.status(400).json({ message: "Vui lòng cung cấp email hoặc mật khẩu mới để cập nhật" });
        }

        const user = await getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        // Kiểm tra mật khẩu cũ nếu cung cấp mật khẩu mới
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Vui lòng cung cấp mật khẩu cũ" });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: "Mật khẩu cũ không đúng" });
            }
        }

        // Chuẩn bị dữ liệu cập nhật
        const updates = {};
        const queryParams = [];

        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "Email không hợp lệ" });
            }
            updates.email = email;
            queryParams.push(email);
        }

        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(newPassword, salt);
            updates.password_hash = passwordHash;
            queryParams.push(passwordHash);
        }

        // Tạo câu truy vấn động
        const fields = Object.keys(updates).map(field => `${field} = ?`).join(', ');
        queryParams.push(userId);

        if (fields) {
            const query = `UPDATE users SET ${fields} WHERE id = ?`;
            const [result] = await db.query(query, queryParams);
            if (result.affectedRows === 0) {
                return res.status(400).json({ message: "Không thể cập nhật thông tin" });
            }
        }

        // Lấy thông tin người dùng sau khi cập nhật
        const updatedUser = await getUserById(userId);
        delete updatedUser.password_hash;

        res.status(200).json({
            message: "Cập nhật thông tin thành công",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email || "Chưa cập nhật",
                role: updatedUser.role,
                status: updatedUser.status,
                isOnline: updatedUser.isOnline,
                created_at: formatDate(updatedUser.created_at),
                last_login: formatDate(updatedUser.last_login),
            },
        });
    } catch (error) {
        console.error("Lỗi updateProfile:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Email đã được sử dụng" });
        }
        res.status(500).json({ message: "Lỗi hệ thống khi cập nhật thông tin" });
    }
};

module.exports = {
    getProfile,
    login,
    logout,
    updateProfile,
};