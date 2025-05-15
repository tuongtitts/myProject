import React, { useState, useEffect } from 'react';
import './userList.css';
import { fetchOnlineUsers } from '../../api/userStatus';
import { connectSocket, disconnectSocket } from '../../socket';

const UserList = ({ expanded, onToggle }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      connectSocket(userId);
    }

    fetchUsers();
    const interval = setInterval(fetchUsers, 10000);

    return () => {
      clearInterval(interval);
      disconnectSocket();
    };
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const onlineUsers = await fetchOnlineUsers();
      setUsers(onlineUsers);
    } catch (error) {
      console.error(' Không thể tải danh sách người dùng:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`status ${expanded ? 'expanded' : ''}`}>
      <div className="status-header">
        Trạng thái người dùng
        <button id="toggle-status" onClick={onToggle}>
          {expanded ? '−' : '+'}
        </button>
      </div>

      <div className="user-list-wrapper">
        <ul className="user-list">
          {loading ? (
            <li>Đang tải danh sách người dùng...</li>
          ) : users.length > 0 ? (
            users.map((user, index) => (
              <li key={user.id} style={{ '--index': index }}>
                <div className="user-avatar">{getInitials(user.name)}</div>
                <div className="user-name">{user.name}</div>
                <div className={`user-status ${user.online ? 'online' : 'offline'}`}>
                  {user.online ? '🟢 Online' : '⚪ Offline'}
                </div>
              </li>
            ))
          ) : (
            <li className="empty">Không có người dùng trực tuyến</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default UserList;