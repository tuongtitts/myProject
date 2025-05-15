import { getAuthHeaders, handleUnauthorizedReact } from './auth';

const API_URL = 'http://localhost:5000/api/userannouncements';

export const getAnnouncements = async (unread = false, navigate) => {
  try {
    const response = await fetch(`${API_URL}?unread=${unread}`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) {
      handleUnauthorizedReact(response, navigate);
      throw new Error(data.message || 'Lỗi khi tải thông báo!');
    }

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error in getAnnouncements:', error.message);
    throw new Error(error.message || 'Lỗi khi tải thông báo!');
  }
};

export const createAnnouncement = async (announcementData, navigate) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(announcementData),
    });

    const data = await response.json();
    if (!response.ok) {
      handleUnauthorizedReact(response, navigate);
      throw new Error(data.message || 'Lỗi khi tạo thông báo!');
    }

    return data;
  } catch (error) {
    console.error('Error in createAnnouncement:', error.message);
    throw new Error(error.message || 'Lỗi khi tạo thông báo!');
  }
};

export const createAnnouncementForAll = async (announcementData, navigate) => {
  try {
    const response = await fetch(`${API_URL}/all`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(announcementData),
    });

    const data = await response.json();
    if (!response.ok) {
      handleUnauthorizedReact(response, navigate);
      throw new Error(data.message || 'Lỗi khi gửi thông báo đến tất cả!');
    }

    return data;
  } catch (error) {
    console.error('Error in createAnnouncementForAll:', error.message);
    throw new Error(error.message || 'Lỗi khi gửi thông báo đến tất cả!');
  }
};

export const markAnnouncementAsRead = async (id, navigate) => {
  try {
    const response = await fetch(`${API_URL}/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('markAnnouncementAsRead failed:', data.message, response.status);
      handleUnauthorizedReact(response, navigate);
      throw new Error(data.message || 'Lỗi khi đánh dấu thông báo!');
    }

    console.log('markAnnouncementAsRead success:', data);
    return data;
  } catch (error) {
    console.error('Error in markAnnouncementAsRead:', error.message);
    throw new Error(error.message || 'Lỗi khi đánh dấu thông báo!');
  }
};

export const deleteAnnouncement = async (id, navigate) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('deleteAnnouncement failed:', data.message, response.status);
      handleUnauthorizedReact(response, navigate);
      throw new Error(data.message || 'Lỗi khi xóa thông báo!');
    }

    console.log('deleteAnnouncement success:', data);
    return data;
  } catch (error) {
    console.error('Error in deleteAnnouncement:', error.message);
    throw new Error(error.message || 'Lỗi khi xóa thông báo!');
  }
};