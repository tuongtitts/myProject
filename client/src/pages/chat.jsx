import React, { useEffect, useState } from 'react';
import { getUserFromToken } from '../api/auth';
import { getMessages, createMessage, deleteMessage } from '../api/message';
import {
  connectSocket,
  getSocket,
  onNewMessage,
  onDeleteMessage,
} from '../socket';
import './chat.css';

function Chat({ navigate }) {
  const user = getUserFromToken();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      connectSocket();
    }

    const handleNewMessage = (msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    const handleDeleteMessage = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    };

    onNewMessage(handleNewMessage);
    onDeleteMessage(handleDeleteMessage);

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('newMessage', handleNewMessage);
        socket.off('deleteMessage', handleDeleteMessage);
      }
    };
  }, [user]);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMessages(navigate);
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Không thể tải tin nhắn.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [navigate]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const msgData = { content: newMessage };
      await createMessage(msgData, navigate);
      setNewMessage('');
    } catch (err) {
      setError(err.message || 'Không thể gửi tin nhăn.');
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Xóa tin nhắn này?')) return;
    try {
      await deleteMessage(messageId, navigate);
    } catch (err) {
      setError(err.message || 'Không thể xóa tin nhắn.');
    }
  };

  if (!user) {
    return <div>Vui lòng <a href="/login">đăng nhập</a> để tham gia chat.</div>;
  }

  return (
    <div className="chat-room">
      <h2>Đoạn chat</h2>

      {error && <div className="error">{error}</div>}
      {loading ? (
        <div>Đang tải tin nhắn...</div>
      ) : (
        <div className="message-list">
          {messages.map((msg) => (
            <div key={msg.id} className="message-item">
              <strong>{msg.sender_name || 'Người dùng'}:</strong> {msg.content}
              <span className="meta">
                {new Date(msg.created_at).toLocaleTimeString()}
                {msg.sender_id === user.id && (
                  <button onClick={() => handleDelete(msg.id)} className="delete-btn">X</button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" disabled={!newMessage.trim()}>Gửi</button>
      </form>
    </div>
  );
}

export default Chat;