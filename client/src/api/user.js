import { getAuthHeaders } from "./auth";

export async function getUserProfile() {
    const response = await fetch("http://localhost:5000/api/user/profile", {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Không thể lấy thông tin người dùng");
    }

    return await response.json();
}

export async function updateUserProfile(userData) {
    const response = await fetch("http://localhost:5000/api/user/profile", {
        method: "PUT",
        headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        throw new Error("Không thể cập nhật thông tin người dùng");
    }

    return await response.json();
}