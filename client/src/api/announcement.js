

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const parseResponse = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    return {};
  }
};

// Tạo thông báo mới
export const createAnnouncement = async (formData) => {
  try {
    console.log("[Debug] Gửi POST /api/announcements");
    const response = await fetch("http://localhost:5000/api/announcements", {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await parseResponse(response);
      console.error(`[Error] Lỗi HTTP: ${response.status} ${response.statusText}`, errorData);
      throw new Error(errorData.message || "Lỗi khi tạo thông báo");
    }

    const data = await parseResponse(response);
    return data;
  } catch (error) {
    console.error(" Lỗi khi tạo thông báo:", error.message);
    throw error;
  }
};

// Lấy tất cả thông báo
export const getAllAnnouncements = async () => {
  try {
    console.log("[Debug] Gửi GET /api/announcements");
    const response = await fetch("http://localhost:5000/api/announcements", {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await parseResponse(response);
      console.error(`[Error] Lỗi HTTP: ${response.status} ${response.statusText}`, errorData);
      throw new Error(errorData.message || "Lỗi khi lấy danh sách thông báo");
    }

    const data = await parseResponse(response);
    return data;
  } catch (error) {
    console.error(" Lỗi khi lấy danh sách thông báo:", error.message);
    throw error;
  }
};

// Cập nhật thông báo
export const updateAnnouncement = async (id, formData) => {
  try {
    console.log(`[Debug] Gửi PUT /api/announcements/${id}`);
    const response = await fetch(`http://localhost:5000/api/announcements/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await parseResponse(response);
      console.error(`[Error] Lỗi HTTP: ${response.status} ${response.statusText}`, errorData);
      throw new Error(errorData.message || "Lỗi khi cập nhật thông báo");
    }

    const data = await parseResponse(response);
    return data;
  } catch (error) {
    console.error(" Lỗi khi cập nhật thông báo:", error.message);
    throw error;
  }
};

// Xóa thông báo
export const deleteAnnouncement = async (id) => {
  try {
    console.log(`[Debug] Gửi DELETE /api/announcements/${id}`);
    const response = await fetch(`http://localhost:5000/api/announcements/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await parseResponse(response);
      console.error(`[Error] Lỗi HTTP: ${response.status} ${response.statusText}`, errorData);
      throw new Error(errorData.message || "Lỗi khi xóa thông báo");
    }

    const data = await parseResponse(response);
    return data;
  } catch (error) {
    console.error(" Lỗi khi xóa thông báo:", error.message);
    throw error;
  }
};