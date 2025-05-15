const jwt = require('jsonwebtoken');
const db = require('../config/db'); 
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token không hợp lệ.' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET không được thiết lập.');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra trạng thái người dùng trong database
    const [users] = await db.query("SELECT id, role, status FROM users WHERE id = ?", [decoded.id]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Người dùng không tồn tại.' });
    }

    const user = users[0];
    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị ngừng hoạt động.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token error:', error.message);
    return res.status(403).json({ message: 'Token hết hạn hoặc không hợp lệ.' });
  }
};

module.exports = authMiddleware;