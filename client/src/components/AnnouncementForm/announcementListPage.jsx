import React, { useState, useEffect } from "react";
import { getAllAnnouncements, updateAnnouncement, deleteAnnouncement } from "../../api/announcement";
import { getSocket } from "../../socket";
import "./announcementListPage.css";

const AnnouncementListPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editAttachment, setEditAttachment] = useState(null);

  // Tải danh sách thông báo
  const fetchNotices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllAnnouncements();
      console.log(" Dữ liệu thông báo:", response); 
      const data = Array.isArray(response) ? response : [];
      setNotices(data);
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
      setError("Không thể tải thông báo. Vui lòng thử lại sau.");
      setNotices([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();

    const socket = getSocket();

    // Socket event listeners
    const handleUpdate = (newItem) => {
      console.log("🔁 Có thông báo mới hoặc được cập nhật:", newItem);
      setNotices((prev) => {
        const currentNotices = Array.isArray(prev) ? prev : [];
        const existed = currentNotices.find((a) => a.id === newItem.id);
        if (existed) {
          return currentNotices.map((item) =>
            item.id === newItem.id ? { ...item, ...newItem } : item
          );
        } else {
          return [newItem, ...currentNotices];
        }
      });
    };

    const handleDelete = ({ id }) => {
      console.log(" Xóa thông báo ID:", id);
      setNotices((prev) => {
        const currentNotices = Array.isArray(prev) ? prev : [];
        return currentNotices.filter((item) => item.id !== id);
      });
    };

    if (socket && socket.connected) {
      socket.on("announcementUpdated", handleUpdate);
      socket.on("announcementDeleted", handleDelete);
    } else {
      const interval = setInterval(() => {
        const s = getSocket();
        if (s && s.connected) {
          s.on("announcementUpdated", handleUpdate);
          s.on("announcementDeleted", handleDelete);
          clearInterval(interval);
        }
      }, 500);
    }

    return () => {
      const s = getSocket();
      if (s) {
        s.off("announcementUpdated", handleUpdate);
        s.off("announcementDeleted", handleDelete);
      }
    };
  }, []);

  // Khi bấm sửa thông báo
  const handleEdit = (announcement) => {
    setEditingId(announcement.id);
    setEditContent(announcement.content || "");
    setEditAttachment(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cập nhật thông báo
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editContent.trim()) {
      alert("Vui lòng nhập nội dung thông báo.");
      return;
    }

    const formData = new FormData();
    formData.append("content", editContent);
    if (editAttachment) formData.append("attachment", editAttachment);

    try {
      await updateAnnouncement(editingId, formData);
      alert(" Cập nhật thông báo thành công!");
      setEditingId(null);
      setEditContent("");
      setEditAttachment(null);
      fetchNotices();
    } catch (error) {
      console.error("Lỗi khi cập nhật thông báo:", error);
      alert(" Cập nhật thông báo thất bại!");
    }
  };

  // Xóa thông báo
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thông báo này không?")) {
      try {
        await deleteAnnouncement(id);
        setNotices((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Lỗi khi xóa thông báo:", error);
        alert(" Xóa thông báo thất bại!");
      }
    }
  };

  const downloadAttachment = (filename) => {
    const url = `http://localhost:5000/uploads/${filename}`;
    window.open(url, "_blank");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="announcement-list-container">
      <div className="announcement-header">
        <h2>Danh sách thông báo</h2>
      </div>


      {editingId && (
        <div className="edit-form">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Chỉnh sửa thông báo</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setEditingId(null);
                  setEditContent("");
                  setEditAttachment(null);
                }}
              >
                ✖
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label htmlFor="editContent">Nội dung thông báo</label>
                <textarea
                  id="editContent"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="editAttachment">Tệp đính kèm mới (để trống nếu không thay đổi)</label>
                <input
                  id="editAttachment"
                  type="file"
                  onChange={(e) => setEditAttachment(e.target.files[0])}
                />
              </div>

              <div className="button-group">
                <button type="submit" disabled={!editContent.trim()}>
                  Cập nhật
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setEditContent("");
                    setEditAttachment(null);
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {loading && <div className="loading-notices">Đang tải danh sách thông báo...</div>}

      {error && <div className="error-notices">{error}</div>}

      {!loading && !error && notices.length === 0 && (
        <div className="no-notices">Chưa có thông báo nào.</div>
      )}


      {!loading && !error && notices.length > 0 && (
        <table>
          <thead>
            <tr>
              <th className="id-col">ID</th>
              <th className="content-col">Nội dung</th>
              <th className="attachment-col">Tệp đính kèm</th>
              <th className="publisher-col">Người đăng</th>
              <th className="date-col">Ngày đăng</th>
              <th className="action-col">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {notices.map((notice) => (
              <tr key={notice.id}>
                <td className="id-col">{notice.id}</td>
                <td className="content-col">
                  <div className="notice-content">{notice.content}</div>
                </td>
                <td className="attachment-col">
                  {notice.file_attachment ? (
                    <div className="attachment-wrapper">
                      {notice.file_attachment.endsWith(".pdf") ? (
                        <img src="/image/pdf-icon.jpg" alt="PDF" className="file-icon" />
                      ) : notice.file_attachment.endsWith(".doc") ||
                        notice.file_attachment.endsWith(".docx") ? (
                        <img src="/image/word-icon.jpg" alt="Word" className="file-icon" />
                      ) : null}
                      <button
                        className="download-btn"
                        onClick={() => downloadAttachment(notice.file_attachment)}
                      >
                        Tải xuống
                      </button>
                    </div>
                  ) : (
                    <span className="no-attachment">Không có</span>
                  )}
                </td>
                <td className="publisher-col">{notice.publisher || "Không rõ"}</td>
                <td className="date-col">{formatDate(notice.created_at)}</td>
                <td className="action-col">
                  <div className="flex space-x-2">
                    <button className="edit_button" onClick={() => handleEdit(notice)}>
                       Sửa
                    </button>
                    <button className="remove_button" onClick={() => handleDelete(notice.id)}>
                       Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AnnouncementListPage;