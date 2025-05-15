import React, { useState, useEffect } from 'react';
import { getSocket } from '../../socket';
import './generalNotice.css';

const GeneralNotice = ({ expanded }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/announcements', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Không thể tải thông báo');
      const data = await response.json();
      setNotices(data);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
      setError('Không thể tải thông báo. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();

    const socket = getSocket();

    const handleUpdate = () => {
      console.log('🔁 Có thông báo mới hoặc được cập nhật - Tải lại danh sách');
      fetchNotices();
    };

    const handleDelete = (deletedObj) => {
      console.log('🗑️ Có thông báo bị xoá - Cập nhật danh sách:', deletedObj);
      setNotices((prev) => prev.filter((n) => n.id !== deletedObj.id));
    };

    if (socket && socket.connected) {
      socket.on('announcementUpdated', handleUpdate);
      socket.on('announcementDeleted', handleDelete);
    } else {
      const interval = setInterval(() => {
        const s = getSocket();
        if (s && s.connected) {
          s.on('announcementUpdated', handleUpdate);
          s.on('announcementDeleted', handleDelete);
          clearInterval(interval);
        }
      }, 500);
    }

    return () => {
      const s = getSocket();
      if (s) {
        s.off('announcementUpdated', handleUpdate);
        s.off('announcementDeleted', handleDelete);
      }
    };
  }, []);

  const downloadAttachment = (filename) => {
    const url = `http://localhost:5000/uploads/${filename}`;
    window.open(url, '_blank');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={`general_notice-main ${expanded ? 'expanded' : ''}`}>
      <div className="notice-header">
        <h2>Thông Báo Chung</h2>
      </div>

      {loading ? (
        <div className="loading-notices">Đang tải thông báo...</div>
      ) : error ? (
        <div className="error-notices">{error}</div>
      ) : notices.length === 0 ? (
        <div className="no-notices">Không có thông báo nào.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nội Dung Thông Báo</th>
              <th>Tệp Đính Kèm</th>
              <th className="publisher-col">Người đăng</th>
              {expanded && <th>Ngày đăng</th>}
            </tr>
          </thead>
          <tbody>
            {notices.map(notice => (
              <tr key={notice.id}>
                <td>
                  <div className="notice-content">{notice.content}</div>
                </td>
                <td>
                  {notice.file_attachment ? (
                    <div className="attachment-wrapper">
                      {notice.file_attachment.endsWith(".pdf") ? (
                        <img src="/image/pdf-icon.jpg" alt="PDF" className="file-icon" />
                      ) : notice.file_attachment.endsWith(".doc") || notice.file_attachment.endsWith(".docx") ? (
                        <img src="/image/word-icon.jpg" alt="Word" className="file-icon" />
                      ) : null}
                      <button
                        className="download-btn"
                        onClick={() => downloadAttachment(notice.file_attachment)}
                      >
                        Xem ngay
                      </button>
                    </div>
                  ) : (
                    <span className="no-attachment">Không có</span>
                  )}
                </td>
                <td className="publisher-col">{notice.publisher || "Không rõ"}</td>
                {expanded && <td>{formatDate(notice.created_at)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GeneralNotice;
