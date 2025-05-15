import { getAuthHeaders } from "./auth";


export async function getAllUsers() {
    try {
        const response = await fetch("http://localhost:5000/api/admin/all", {
            method: "GET",
            headers: getAuthHeaders(),
            credentials: "include",
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Lỗi API getAllUsers:", response.status, errorData);
            throw new Error(errorData.message || "Không thể tải danh sách người dùng");
        }

        return await response.json();
    } catch (error) {
        console.error("Lỗi khi gọi API getAllUsers:", error);
        throw error;
    }
}


export async function resetPassword(userId) {
    try {
        const response = await fetch(`http://localhost:5000/api/admin/${userId}/reset-password`, {
            method: "PUT",
            headers: getAuthHeaders(),
            credentials: "include",
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Lỗi API resetPassword:", response.status, errorData);
            throw new Error(errorData.message || "Không thể reset mật khẩu người dùng");
        }

        return await response.json();
    } catch (error) {
        console.error("Lỗi khi gọi API resetPassword:", error);
        throw error;
    }
}


export async function deleteUser(userId) {
    try {
        const response = await fetch(`http://localhost:5000/api/admin/user/${userId}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
            credentials: "include",
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Lỗi API deleteUser:", response.status, errorData);
            throw new Error(errorData.message || "Không thể xóa người dùng");
        }

        return await response.json();
    } catch (error) {
        console.error("Lỗi khi gọi API deleteUser:", error);
        throw error;
    }
}


export async function createUser(userData) {
    try {
        const response = await fetch("http://localhost:5000/api/admin", {
            method: "POST",
            headers: {
                ...getAuthHeaders(),
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Lỗi API createUser:", response.status, errorData);
            throw new Error(errorData.message || "Không thể tạo người dùng mới");
        }

        return await response.json();
    } catch (error) {
        console.error("Lỗi khi gọi API createUser:", error);
        throw error;
    }
}


export async function updateUser(userId, userData) {
    try {
        const { role, ...dataWithoutRole } = userData; // Exclude role from userData
        const response = await fetch(`http://localhost:5000/api/admin/${userId}`, {
            method: "PUT",
            headers: {
                ...getAuthHeaders(),
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(dataWithoutRole), 
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Lỗi API updateUser:", response.status, errorData);
            throw new Error(errorData.message || "Không thể cập nhật người dùng");
        }

        return await response.json();
    } catch (error) {
        console.error("Lỗi khi gọi API updateUser:", error);
        throw error;
    }
}