const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/courses';

export const getCoursesByCategory = async (categoryId) => {
  const res = await fetch(`${API_URL}/category/${categoryId}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không thể tải khóa học');
  }
  return await res.json();
};

export const createCourse = async (courseData) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(courseData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không thể thêm khóa học');
  }
  return await res.json();
};

export const deleteCourse = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không thể xóa khóa học');
  }
  return await res.json();
};