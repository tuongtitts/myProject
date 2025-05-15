import { getAuthHeaders, handleUnauthorizedReact } from "./auth.js";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/reminders";

export async function fetchReminders(studentId, month, year) {
    if (!studentId || month < 0 || month > 11 || !Number.isInteger(year)) {
        console.error("Tham số đầu vào không hợp lệ");
        return [];
    }
    const url = `${API_URL}/${studentId}/${month + 1}/${year}`;
    try {
        const response = await fetch(url, {
            method: "GET", 
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            handleUnauthorizedReact(response);
            const errorText = await response.text();
            throw new Error(`Lỗi khi lấy ghi chú: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error(`Lỗi khi lấy ghi chú (URL: ${url}):`, error);
        return [];
    }
}

export async function createReminder(reminder) {
    if (!reminder?.student_id || !reminder?.schedule_date || !reminder?.note) {
        console.error("Dữ liệu ghi chú không hợp lệ");
        throw new Error("Dữ liệu ghi chú không hợp lệ");
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                ...getAuthHeaders(),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(reminder),
        });

        if (!response.ok) {
            handleUnauthorizedReact(response);
            const errorText = await response.text();
            throw new Error(`Lỗi khi thêm ghi chú: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Lỗi khi thêm ghi chú:", error);
        throw error;
    }
}

export async function deleteReminder(id, studentId) {
    if (!id || !studentId) {
        console.error("ID ghi chú hoặc studentId không hợp lệ");
        throw new Error("ID ghi chú hoặc studentId không hợp lệ");
    }

    try {
        const url = `${API_URL}/${studentId}/${id}`;
        console.log(`Sending DELETE request to: ${url}`);

        const response = await fetch(url, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });

        console.log(`Delete response status: ${response.status}`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Delete reminder failed: ${response.status} - ${errorText}`);
            handleUnauthorizedReact(response);
            throw new Error(`Lỗi khi xóa ghi chú: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log(`Delete reminder success:`, data);
        return data;
    } catch (error) {
        console.error("Lỗi khi xóa ghi chú:", error);
        throw error;
    }
}