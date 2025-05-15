const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const userModel = require('../models/userModel');

dotenv.config();

const login = async (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập đủ thông tin' });
  }

  try {
    const user = await userModel.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User không tồn tại' });
    }

    // Kiểm tra trạng thái
    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Tài khoản của bạn đã bị ngừng hoạt động. Vui lòng liên hệ quản trị viên.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Mật khẩu sai' });
    }

    await userModel.updateUserOnlineStatus(id, 1);

    await require('../config/db').query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [id]
    );

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET không được thiết lập');
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, isOnline: 1 },
      role: user.role,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Lỗi server', detail: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const updated = await userModel.updateUserOnlineStatus(req.user.id, 0);
    if (!updated) {
      return res.status(404).json({ error: 'User không tồn tại' });
    }

    res.json({ success: true, message: 'Đăng xuất thành công' });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({ error: 'Lỗi server', detail: error.message });
  }
};

module.exports = { login, logout };