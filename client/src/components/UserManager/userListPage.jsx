import React, { useState, useEffect } from "react";
import { getAllUsers, updateUser, resetPassword, deleteUser } from "../../api/userAdmin";
import { fetchOnlineUsers } from "../../api/userStatus";
import "./userListPage.css";

const formatDateTime = (datetime) => {
  if (!datetime) return "Không có";
  try {
    if (typeof datetime === 'string' && datetime.includes('/')) {
      return datetime;
    }
    const date = new Date(datetime);
    if (isNaN(date.getTime())) {
      console.error("Ngày giờ không hợp lệ:", datetime);
      return datetime;
    }
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  } catch (error) {
    console.error("Lỗi khi format thời gian:", error, "với giá trị:", datetime);
    return datetime;
  }
};

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchUserList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
      setError("Không thể tải danh sách người dùng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOnlineUserList = async () => {
    try {
      const data = await fetchOnlineUsers();
      setOnlineUsers(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng online:", err);
    }
  };

  useEffect(() => {
    fetchUserList();
    fetchOnlineUserList();
    const interval = setInterval(fetchOnlineUserList, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showModal]);

  const handleEdit = (user) => {
    setEditingUser({ ...user }); // Sao chép dữ liệu người dùng
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setShowModal(false);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const { id, name, status } = editingUser; // Loại bỏ role
      await updateUser(id, { name, status }); // Chỉ gửi name và status
      alert("Cập nhật người dùng thành công!");
      fetchUserList();
      handleCloseModal();
    } catch (error) {
      console.error("Lỗi khi cập nhật người dùng:", error);
      alert("Cập nhật người dùng thất bại!");
    }
  };

  const handleReset = async (userId) => {
    if (window.confirm("Bạn có chắc muốn reset mật khẩu không?")) {
      try {
        await resetPassword(userId);
        alert("Đã reset mật khẩu thành công!");
      } catch (error) {
        console.error("Lỗi khi reset mật khẩu:", error);
        alert("Reset mật khẩu thất bại!");
      }
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này không?")) {
      try {
        await deleteUser(userId);
        alert("Đã xóa người dùng thành công!");
        fetchUserList();
      } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        alert("Xóa người dùng thất bại!");
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const isOnline = onlineUsers.some(onlineUser => onlineUser.id === user.id);
    const onlineStatus = isOnline ? "online" : "offline";
    const lowerSearchTerm = searchTerm.toLowerCase();

    return (
      String(user.id).includes(lowerSearchTerm) ||
      user.name?.toLowerCase().includes(lowerSearchTerm) ||
      user.role?.toLowerCase().includes(lowerSearchTerm) ||
      (lowerSearchTerm === "online" && onlineStatus === "online") ||
      (lowerSearchTerm === "offline" && onlineStatus === "offline")
    );
  });

  return (
    <div className="user-list-container p-4" style={{ margin: "2rem", minWidth: "110%" }}>
      <h2 style={{ fontSize: "2.4rem", fontWeight: "bold" }}>
        Danh sách người dùng
      </h2>

      <div className="search-container">
        <input
          type="text"
          placeholder="Tìm kiếm theo ID, tên, vai trò, online..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button
          onClick={() => {
            fetchUserList();
            fetchOnlineUserList();
          }}
          className="refresh-button"
          title="Làm mới danh sách"
        >
          🔄
        </button>
      </div>

      {/* Modal chỉnh sửa */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chỉnh sửa người dùng</h3>
              <button className="close-button" onClick={handleCloseModal}>
                Đóng
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="edit-user-form">
              <div className="form-group">
                <label>ID</label>
                <input
                  type="text"
                  value={editingUser.id}
                  disabled
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Tên</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Vai trò</label>
                <p className="form-control-static">
                  {editingUser.role === "admin" ? "Quản trị viên" :
                   editingUser.role === "teacher" ? "Giảng viên" : "Học viên"}
                </p>
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                  className="form-control"
                  required
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <p>Đang tải danh sách người dùng...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredUsers.length === 0 && (
        <div className="empty-state">
          {searchTerm
            ? "Không tìm thấy người dùng nào phù hợp."
            : "Chưa có người dùng nào."}
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Online</th>
                <th>Ngày tạo</th>
                <th>Lần đăng nhập cuối</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isOnline = onlineUsers.some(onlineUser => onlineUser.id === user.id);

                return (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email || "Không có"}</td>
                    <td>
                      {user.role === "admin" ? "Quản trị viên" :
                       user.role === "teacher" ? "Giảng viên" :
                       "Học viên"}
                    </td>
                    <td>
                      <span className={user.status === "active" ? "status-active" : "status-inactive"}>
                        {user.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
                      </span>
                    </td>
                    <td>
                      <span className={isOnline ? "status-online" : "status-offline"}>
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td className="date-column">{formatDateTime(user.created_at)}</td>
                    <td className="date-column">{formatDateTime(user.last_login)}</td>
                    <td className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(user)}
                        title="Chỉnh sửa"
                      >
                        Sửa
                      </button>
                      <button
                        className="reset-button"
                        onClick={() => handleReset(user.id)}
                        title="Reset mật khẩu"
                      >
                        Reset
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(user.id)}
                        title="Xóa"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserListPage;