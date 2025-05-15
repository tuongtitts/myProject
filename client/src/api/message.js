import { getAuthHeaders, handleUnauthorizedReact } from './auth';

const API_URL = 'http://localhost:5000/api/messages';

export const getMessages = async (navigate) => {
  try {
    const response = await fetch(API_URL, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) {
      handleUnauthorizedReact(response, navigate);
      throw new Error(data.message || 'Lỗi khi tải tin nhắn!');
    }

    return Array.isArray(data) ? data : []; 
  } catch (error) {
    console.error('Error in getMessages:', error.message);
    throw new Error(error.message || 'Lỗi khi tải tin nhắn!');
  }
};

export const createMessage = async (msgData, navigate) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(msgData),
    });

    const data = await response.json();
    if (!response.ok) {
      handleUnauthorizedReact(response, navigate);
      throw new Error(data.message || 'Lỗi khi gửi tin nhắn!');
    }

    return data;
  } catch (error) {
    console.error('Error in createMessage:', error.message);
    throw new Error(error.message || 'Lỗi khi gửi tin nhắn!');
  }
};

export const deleteMessage = async (messageId, navigate) => {
  try {
    const response = await fetch(`${API_URL}/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) {
      handleUnauthorizedReact(response, navigate);
      throw new Error(data.message || 'Lỗi khi xóa tin nhắn!');
    }

    return data;
  } catch (error) {
    console.error('Error in deleteMessage:', error.message);
    throw new Error(error.message || 'Lỗi khi xóa tin nhắn!');
  }
};