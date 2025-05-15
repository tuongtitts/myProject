import { io } from 'socket.io-client';
import { getUserFromToken } from './api/auth';

let socket = null;
let isConnecting = false;

export const connectSocket = () => {
  if (socket && socket.connected) {
    console.log('Socket already connected:', socket.id);
    return socket;
  }

  if (isConnecting) {
    console.log('Socket connection in progress');
    return socket;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found, cannot connect socket');
    return null;
  }

  const user = getUserFromToken();
  const userId = user?.id;
  if (!userId) {
    console.error('No userId found, cannot connect socket');
    return null;
  }

  isConnecting = true;
  socket = io('http://localhost:5000', {
    transports: ['websocket'],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    socket.emit('joinRoom', { studentId: userId });
    console.log(`Joined room student_${userId}`);
    isConnecting = false;
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message, err.stack);
    if (err.message.includes('Authentication error')) {
      console.error('Authentication failed, clearing token');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    isConnecting = false;
  });

  socket.on('reconnect_attempt', (attempt) => {
    console.log(`Reconnection attempt #${attempt}`);
  });

  socket.on('reconnect_failed', () => {
    console.error('Failed to reconnect after maximum attempts');
    isConnecting = false;
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected, reason:', reason);
    isConnecting = false;
  });

  return socket;
};

export const joinCourseRoom = (courseId) => {
  if (socket && socket.connected && courseId) {
    socket.emit('joinRoom', { courseId });
    console.log(`Joined room course_${courseId}`);
  } else {
    console.warn('Socket not connected or courseId missing:', { socketConnected: socket?.connected, courseId });
  }
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
    console.log('Socket manually disconnected');
    socket = null;
  }
};

export const getSocket = () => socket;

// Socket.IO Event Listeners
export const onNewComment = (callback) => {
  if (socket) {
    socket.off('newComment');
    socket.on('newComment', (data) => {
      console.log('Received newComment:', data);
      callback(data);
    });
  } else {
    console.warn('Socket not initialized for newComment listener');
  }
};

export const onDeleteComment = (callback) => {
  if (socket) {
    socket.off('deleteComment');
    socket.on('deleteComment', (data) => {
      console.log('Received deleteComment:', data);
      callback(data);
    });
  } else {
    console.warn('Socket not initialized for deleteComment listener');
  }
};

export const onNewMessage = (callback) => {
  if (socket) {
    socket.off('newMessage');
    socket.on('newMessage', (data) => {
      console.log('Received newMessage:', data);
      callback(data);
    });
  } else {
    console.warn('Socket not initialized for newMessage listener');
  }
};

export const onDeleteMessage = (callback) => {
  if (socket) {
    socket.off('deleteMessage');
    socket.on('deleteMessage', (data) => {
      console.log('Received deleteMessage:', data);
      callback(data);
    });
  } else {
    console.warn('Socket not initialized for deleteMessage listener');
  }
};

export const onNewAnnouncement = (callback) => {
  if (socket) {
    socket.off('newAnnouncement');
    socket.on('newAnnouncement', (data) => {
      console.log('Received newAnnouncement:', data);
      callback(data);
    });
  } else {
    console.warn('Socket not initialized for newAnnouncement listener');
  }
};

export const onAnnouncementRead = (callback) => {
  if (socket) {
    socket.off('announcementRead');
    socket.on('announcementRead', (data) => {
      console.log('Received announcementRead:', data);
      callback(data);
    });
  } else {
    console.warn('Socket not initialized for announcementRead listener');
  }
};

export const onAnnouncementDeleted = (callback) => {
  if (socket) {
    socket.off('announcementDeleted');
    socket.on('announcementDeleted', (data) => {
      console.log('Received announcementDeleted:', data);
      callback(data);
    });
  } else {
    console.warn('Socket not initialized for announcementDeleted listener');
  }
};

export const onMaterialCreated = (callback) => {
  if (socket) {
    socket.off('materialCreated');
    socket.on('materialCreated', (data) => {
      console.log('Received materialCreated:', data);
      callback(data);
    });
  } else {
    console.warn('Socket not initialized for materialCreated listener');
  }
};

export const onMaterialDeleted = (callback) => {
  if (socket) {
    socket.off('materialDeleted');
    socket.on('materialDeleted', (data) => {
      console.log('Received materialDeleted:', data);
      callback(data);
    });
  } else {
    console.warn('Socket not initialized for materialDeleted listener');
  }
};

export const onMaterialCompleted = (callback) => {
  if (socket) {
    socket.off('materialCompleted');
    socket.on('materialCompleted', (data) => {
      console.log('Received materialCompleted:', data);
      callback(data);
    });
  } else {
    console.warn('Socket not initialized for materialCompleted listener');
  }
};

export const onLessonProgressCreated = (callback) => {
  if (socket) {
    socket.off('lessonProgressCreated');
    socket.on('lessonProgressCreated', (data) => {
      console.log('Received lessonProgressCreated:', data);
      callback(data);
    });
  } else {
    console.warn('Socket not initialized for lessonProgressCreated listener');
  }
};

export const onLessonProgressUpdated = (callback) => {
  if (socket) {
    socket.off('lessonProgressUpdated');
    socket.on('lessonProgressUpdated', (data) => {
      console.log('Received lessonProgressUpdated:', data);
      callback(data);
    });
  } else {
    console.warn('Socket not initialized for lessonProgressUpdated listener');
  }
};

export const onLessonProgressDeleted = (callback) => {
  if (socket) {
    socket.off('lessonProgressDeleted');
    socket.on('lessonProgressDeleted', (data) => {
      console.log('Received lessonProgressDeleted:', data);
      callback(data);
    });
  } else {
    console.warn('Socket not initialized for lessonProgressDeleted listener');
  }
};

export default {
  connectSocket,
  disconnectSocket,
  getSocket,
  joinCourseRoom,
  onNewComment,
  onDeleteComment,
  onNewMessage,
  onDeleteMessage,
  onNewAnnouncement,
  onAnnouncementRead,
  onAnnouncementDeleted,
  onMaterialCreated,
  onMaterialDeleted,
  onMaterialCompleted,
  onLessonProgressCreated,
  onLessonProgressUpdated,
  onLessonProgressDeleted,
};