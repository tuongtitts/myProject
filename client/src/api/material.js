const API_URL = "http://localhost:5000/api/materials";

// Lấy danh sách tài liệu theo bài học 
export const getMaterials = async (lessonId) => {
  try {
    const response = await fetch(`${API_URL}?lesson_id=${lessonId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Lỗi khi tải danh sách tài liệu!");
    }

    return data; 
  } catch (error) {
    console.error("Error in getMaterials:", error.message);
    throw new Error(error.message || "Lỗi khi tải danh sách tài liệu!");
  }
};

// Tạo tài liệu mới 
export const createMaterial = async (materialData) => {
  try {
    const { title, lesson_id, file, file_type, file_size } = materialData;
    const formData = new FormData();
    formData.append('title', title);
    formData.append('lesson_id', lesson_id);
    formData.append('file', file);
    formData.append('file_type', file_type);
    formData.append('file_size', file_size);

    const response = await fetch(API_URL, {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Lỗi khi tạo tài liệu!");
    }

    return data; 
  } catch (error) {
    console.error("Error in createMaterial:", error.message);
    throw new Error(error.message || "Lỗi khi tạo tài liệu!");
  }
};

// Xóa tài liệu 
export const deleteMaterial = async (materialId) => {
  try {
    const response = await fetch(`${API_URL}/${materialId}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Lỗi khi xóa tài liệu!");
    }

    return data; 
  } catch (error) {
    console.error("Error in deleteMaterial:", error.message);
    throw new Error(error.message || "Lỗi khi xóa tài liệu!");
  }
};