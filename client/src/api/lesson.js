const API_URL = "http://localhost:5000/api/lessons";

// Tạo bài học mới (POST /api/lessons)
export const createLesson = async (lessonData) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lessonData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Lỗi khi tạo bài học!");
    }

    return data;
  } catch (error) {
    console.error("Error in createLesson:", error.message);
    throw new Error(error.message || "Lỗi khi tạo bài học!");
  }
};


export const getLessonsByCourse = async (courseId) => {
  try {
    const response = await fetch(`${API_URL}/${courseId}`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Lỗi khi tải danh sách bài học!");
    }

    return data; 
  } catch (error) {
    console.error("Error in getLessonsByCourse:", error.message);
    throw new Error(error.message || "Lỗi khi tải danh sách bài học!");
  }
};


export const getLessonDetails = async (lessonId) => {
  try {
    const response = await fetch(`${API_URL}/details/${lessonId}`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Lỗi khi tải chi tiết bài học!");
    }

    return data; 
  } catch (error) {
    console.error("Error in getLessonDetails:", error.message);
    throw new Error(error.message || "Lỗi khi tải chi tiết bài học!");
  }
};


export const updateLesson = async (lessonId, updatedData) => {
  try {
    const response = await fetch(`${API_URL}/${lessonId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Lỗi khi cập nhật bài học!");
    }

    return data; 
  } catch (error) {
    console.error("Error in updateLesson:", error.message);
    throw new Error(error.message || "Lỗi khi cập nhật bài học!");
  }
};


export const deleteLesson = async (lessonId) => {
  try {
    const response = await fetch(`${API_URL}/${lessonId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Lỗi khi xóa bài học!");
    }

    return data; 
  } catch (error) {
    console.error("Error in deleteLesson:", error.message);
    throw new Error(error.message || "Lỗi khi xóa bài học!");
  }
};