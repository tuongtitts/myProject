import { useState, useEffect } from 'react';
import { getAnnouncements, markAnnouncementAsRead, deleteAnnouncement } from '../../api/userAnnouncement';
import { connectSocket, getSocket, onNewAnnouncement, onAnnouncementRead, onAnnouncementDeleted } from '../../socket';
import './useNotifications.css'

const useNotifications = (navigate) => {
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchAnnouncements();
      connectSocket();
    }

    const handleNewAnnouncement = (announcement) => {
      console.log('Handling new announcement:', announcement);
      setAnnouncements((prev) => {
        if (prev.find((a) => a.id === announcement.id)) return prev;
        return [announcement, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    };

    const handleAnnouncementRead = ({ id }) => {
      console.log('Handling announcementRead:', id);
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    };

    const handleAnnouncementDeleted = ({ id }) => {
      console.log('Handling announcementDeleted:', id);
      setAnnouncements((prev) => {
        const deletedAnnouncement = prev.find((a) => a.id === id);
        const newAnnouncements = prev.filter((a) => a.id !== id);
        if (deletedAnnouncement && !deletedAnnouncement.is_read) {
          setUnreadCount((prev) => Math.max(prev - 1, 0));
        }
        return newAnnouncements;
      });
    };

    onNewAnnouncement(handleNewAnnouncement);
    onAnnouncementRead(handleAnnouncementRead);
    onAnnouncementDeleted(handleAnnouncementDeleted);

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('newAnnouncement', handleNewAnnouncement);
        socket.off('announcementRead', handleAnnouncementRead);
        socket.off('announcementDeleted', handleAnnouncementDeleted);
      }
    };
  }, [navigate]);

  const fetchAnnouncements = async () => {
    try {
      const data = await getAnnouncements(false, navigate);
      console.log('Fetched announcements:', data);
      setAnnouncements(data);
      setUnreadCount(data.filter((a) => !a.is_read).length);
      setError(null);
    } catch (err) {
      setError(err.message || 'Không thể tải thông báo.');
      console.error('Fetch announcements error:', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAnnouncementAsRead(id, navigate);
      // Cập nhật trạng thái dự phòng
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      setError(null);
    } catch (err) {
      setError(err.message || 'Không thể đánh dấu thông báo.');
      console.error('Mark as read error:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAnnouncement(id, navigate);
      // Cập nhật trạng thái dự phòng
      setAnnouncements((prev) => {
        const deletedAnnouncement = prev.find((a) => a.id === id);
        const newAnnouncements = prev.filter((a) => a.id !== id);
        if (deletedAnnouncement && !deletedAnnouncement.is_read) {
          setUnreadCount((prev) => Math.max(prev - 1, 0));
        }
        return newAnnouncements;
      });
      setError(null);
    } catch (err) {
      setError(err.message || 'Không thể xóa thông báo.');
      console.error('Delete announcement error:', err);
    }
  };

  return {
    announcements,
    unreadCount,
    error,
    handleMarkAsRead,
    handleDelete,
    fetchAnnouncements,
  };
};

export default useNotifications;