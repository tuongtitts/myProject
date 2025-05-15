import { getAuthHeaders, handleUnauthorizedReact } from './auth';

const API_URL = 'http://localhost:5000/api/comments';

export const getCommentsByLesson = async (lessonId, navigate) => {
  try {
    const response = await fetch(`${API_URL}/lesson/${lessonId}`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      handleUnauthorizedReact(response, navigate);
      throw new Error(data.message || 'Lỗi khi tải bình luận!');
    }

    return data;
  } catch (error) {
    console.error('Error in getCommentsByLesson:', error.message);
    throw new Error(error.message || 'Lỗi khi tải bình luận!');
  }
};

export const createComment = async (commentData, navigate) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(commentData),
    });

    const data = await response.json();

    if (!response.ok) {
      handleUnauthorizedReact(response, navigate);
      throw new Error(data.message || 'Lỗi khi gửi bình luận!');
    }

    return data;
  } catch (error) {
    console.error('Error in createComment:', error.message);
    throw new Error(error.message || 'Lỗi khi gửi bình luận!');
  }
};

export const deleteComment = async (commentId, lessonId, navigate) => {
  try {
    const response = await fetch(`${API_URL}/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ lesson_id: lessonId }), 
    });

    const data = await response.json();

    if (!response.ok) {
      handleUnauthorizedReact(response, navigate);
      throw new Error(data.message || 'Lỗi khi xóa bình luận!');
    }

    return data;
  } catch (error) {
    console.error('Error in deleteComment:', error.message);
    throw new Error(error.message || 'Lỗi khi xóa bình luận!');
  }
};