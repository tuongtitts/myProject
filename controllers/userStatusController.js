const db = require("../config/db");

exports.getOnlineUsers = async (req, res) => {
    try {
        const [onlineUsers] = await db.query("SELECT id, name, isOnline FROM users WHERE isOnline = 1");
        res.status(200).json({ online_users: onlineUsers });
    } catch (error) {
        res.status(500).json({ message: " Lỗi server khi lấy danh sách user online!" });
    }
};
