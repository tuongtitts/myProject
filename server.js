require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/userAdminRoutes');
const userOnlineRoutes = require('./routes/userStatusRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const materialRoutes = require('./routes/materialRoutes');
const lessonProgressRoutes = require('./routes/lessonProgressRoutes');
const materialCompletionRoutes = require('./routes/materialCompletionRoutes');
const commentRoutes = require('./routes/commentRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userAnnouncementRoutes = require('./routes/userAnnouncementRoutes');

const initSocket = require('./socket');

const app = express();
const server = http.createServer(app);

// Khởi tạo Socket.io
const io = initSocket(server);

// Lưu io vào app để controller sử dụng
app.set('socketio', io);

// Gắn io vào req để sử dụng trong các controller
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Sau khi có io, khởi tạo announcementRoutes
const announcementRoutes = require('./routes/announcementRoutes')(io);

// Middleware CORS
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  })
);

// Các middleware cơ bản
app.use(express.json());
app.use(cookieParser());
app.options('*', cors());

// Cấu hình bảo mật cookie
app.use((req, res, next) => {
  const originalCookie = res.cookie.bind(res);
  res.cookie = function (name, value, options = {}) {
    const secureOptions = {
      ...options,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    };
    return originalCookie(name, value, secureOptions);
  };
  next();
});

// Static assets
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/uploads_material', express.static(path.join(__dirname, 'public', 'Uploads_material')));

// Log mỗi request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Khai báo route chính
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users/online', userOnlineRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/lesson-progress', lessonProgressRoutes);
app.use('/api/material-completion', materialCompletionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/userannouncements', userAnnouncementRoutes);

// Route test
app.get('/', (req, res) => {
  res.send('Server đang chạy!');
});

// 404 Not Found
app.use((req, res) => {
  res.status(404).json({ error: 'API Not Found' });
});

// 500 Internal Error
app.use((err, req, res, next) => {
  console.error('Lỗi Server:', err);
  res.status(500).json({ error: 'Lỗi máy chủ. Vui lòng thử lại sau.' });
});

// Chạy server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});