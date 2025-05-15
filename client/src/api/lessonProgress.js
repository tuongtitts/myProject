const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/lesson-progress';

// Lấy tiến độ bài học
export const getLessonProgress = async (studentId, lessonId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
  }

  const res = await fetch(`${API_URL}/${studentId}/${lessonId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('Error in getLessonProgress:', { status: res.status, message: data.message, studentId, lessonId });
    throw new Error(data.message || 'Lỗi khi tải tiến độ');
  }
  return data;
};

// Tạo hoặc cập nhật tiến độ bài học
export const createOrUpdateLessonProgress = async (studentId, lessonId, progressPercentage, isCompleted) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
    }

    const currentProgress = await getLessonProgress(studentId, lessonId).catch(() => ({
      progress_percentage: 0,
      is_completed: false,
    }));

    if (
      currentProgress.progress_percentage === progressPercentage &&
      currentProgress.is_completed === isCompleted
    ) {
      console.log('No change in progress, skipping API update:', { studentId, lessonId, progressPercentage });
      return currentProgress;
    }

    const res = await fetch(`${API_URL}/${studentId}/${lessonId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        progress_percentage: progressPercentage,
        is_completed: isCompleted,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Error in createOrUpdateLessonProgress:', {
        status: res.status,
        message: errorData.message,
        studentId,
        lessonId,
        progressPercentage,
        isCompleted,
      });
      throw new Error(errorData.message || 'Lỗi server');
    }

    const data = await res.json().catch(() => null);
    return data;
  } catch (error) {
    console.error('Error in createOrUpdateLessonProgress:', error.message, error.stack);
    throw error;
  }
};

// Xóa tiến độ bài học
export const deleteLessonProgress = async (studentId, lessonId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
  }

  const res = await fetch(`${API_URL}/${studentId}/${lessonId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('Error in deleteLessonProgress:', { status: res.status, message: data.message, studentId, lessonId });
    throw new Error(data.message || 'Lỗi khi xóa tiến độ');
  }
  return data;
};