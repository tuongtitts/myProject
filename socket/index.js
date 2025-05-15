const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.error('Socket auth error: No token provided');
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      console.log('Socket auth success: UserID:', decoded.id);
      next();
    } catch (err) {
      console.error('Socket auth error:', err.message);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('joinRoom', ({ studentId, courseId }) => {
      try {
        if (studentId) {
          socket.join(`student_${studentId}`);
          console.log(`User ${studentId} joined room student_${studentId}`);
        } else {
          console.warn('No studentId provided for joinRoom');
        }

        // Tham gia room course_${courseId} nếu được cung cấp
        if (courseId) {
          socket.join(`course_${courseId}`);
          console.log(`User ${studentId} joined room course_${courseId}`);
        } else {
          console.log('No courseId provided, skipping course room join');
        }
      } catch (err) {
        console.error('Error in joinRoom:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};